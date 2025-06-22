using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace HospitalManagement.API.Hubs
{
    [Authorize]
    public class CommunicationHub : Hub
    {
        private readonly IMessageService _messageService;
        private readonly ILabReportService _labReportService;
        private readonly ILogger<CommunicationHub> _logger;
        private static readonly Dictionary<string, UserConnection> _connections = new();

        public CommunicationHub(
            IMessageService messageService,
            ILabReportService labReportService,
            ILogger<CommunicationHub> logger)
        {
            _messageService = messageService;
            _labReportService = labReportService;
            _logger = logger;
        }

        // FIXED: Add nullable parameter for OnDisconnectedAsync
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out var userConnection))
            {
                userConnection.IsOnline = false;
                userConnection.DisconnectedAt = DateTime.UtcNow;

                // Remove from groups
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userConnection.UserId}");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Doctors");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Patients");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");

                // Notify others about user going offline
                await Clients.All.SendAsync("UserPresenceUpdated", new
                {
                    UserId = userConnection.UserId,
                    UserName = userConnection.UserName,
                    IsOnline = false,
                    LastSeen = DateTime.UtcNow
                });

                _connections.Remove(Context.ConnectionId);

                _logger.LogInformation($"User {userConnection.UserName} (ID: {userConnection.UserId}) disconnected");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Connection Management
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var userName = GetUserName();
            var userType = GetUserType();

            if (userId != null)
            {
                var userConnection = new UserConnection
                {
                    UserId = userId.Value,
                    UserName = userName,
                    UserType = userType,
                    ConnectionId = Context.ConnectionId,
                    ConnectedAt = DateTime.UtcNow,
                    IsOnline = true
                };

                _connections[Context.ConnectionId] = userConnection;

                // Join user-specific group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");

                // Join role-specific groups
                if (userType == "Doctor")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Doctors");
                }
                else if (userType == "Patient")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Patients");
                }
                else if (userType == "Admin")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                }

                // Notify others about user coming online
                await Clients.All.SendAsync("UserPresenceUpdated", new
                {
                    UserId = userId,
                    UserName = userName,
                    IsOnline = true,
                    LastSeen = DateTime.UtcNow,
                    CurrentActivity = "Online"
                });

                // Send current online users list to the new connection
                var onlineUsers = _connections.Values
                    .Where(c => c.IsOnline)
                    .Select(c => new
                    {
                        UserId = c.UserId,
                        UserName = c.UserName,
                        IsOnline = c.IsOnline,
                        LastSeen = c.ConnectedAt
                    }).ToList();

                await Clients.Caller.SendAsync("OnlineUsersList", onlineUsers);

                _logger.LogInformation($"User {userName} (ID: {userId}) connected with connection {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        // Message Methods
        public async Task SendMessage(MessageDto messageDto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return;

                // Save message to database
                messageDto.SenderId = userId.Value;
                messageDto.SentDate = DateTime.UtcNow;

                // FIXED: Use correct method name
                var savedMessage = await _messageService.CreateMessageAsync(messageDto);

                // Send to specific user
                await Clients.Group($"User_{messageDto.ReceiverId}")
                    .SendAsync("ReceiveMessage", new
                    {
                        Id = savedMessage.Id.ToString(),
                        SenderId = savedMessage.SenderId,
                        SenderName = GetUserName(),
                        ReceiverId = savedMessage.ReceiverId,
                        ReceiverName = "Recipient",
                        Message = savedMessage.MessageContent,
                        Timestamp = savedMessage.SentDate,
                        MessageType = "text",
                        IsRead = false,
                        ConversationId = $"conv_{Math.Min(savedMessage.SenderId, savedMessage.ReceiverId)}_{Math.Max(savedMessage.SenderId, savedMessage.ReceiverId)}"
                    });

                // Send delivery confirmation to sender
                await Clients.Caller.SendAsync("MessageDelivered", savedMessage.Id.ToString(), DateTime.UtcNow);

                _logger.LogInformation($"Message sent from user {userId} to user {messageDto.ReceiverId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                await Clients.Caller.SendAsync("MessageError", "Failed to send message");
            }
        }

        public async Task SendPrivateMessage(int receiverId, string message, string messageType = "text")
        {
            var userId = GetUserId();
            if (userId == null) return;

            var messageDto = new MessageDto
            {
                SenderId = userId.Value,
                ReceiverId = receiverId,
                Subject = "Private Message",
                MessageContent = message,
                IsRead = false,
                SentDate = DateTime.UtcNow
            };

            await SendMessage(messageDto);
        }

        public async Task MarkMessageAsRead(string messageId)
        {
            try
            {
                if (int.TryParse(messageId, out var id))
                {
                    await _messageService.MarkAsReadAsync(id);

                    // Notify sender about read receipt
                    var message = await _messageService.GetMessageByIdAsync(id);
                    if (message != null)
                    {
                        await Clients.Group($"User_{message.SenderId}")
                            .SendAsync("MessageRead", messageId, DateTime.UtcNow);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking message {messageId} as read");
            }
        }

        // FIXED: Update lab result priority determination with proper type handling
        private string DetermineLabResultPriority(LabReportDto labReport)
        {
            // FIXED: Convert decimal to double for comparison
            var criticalValues = new[]
            {
                (double)labReport.CholesterolLevel > 240.0,
                (double)labReport.SucroseLevel > 180.0,
                (double)labReport.HeartBeatRatio < 60.0 || (double)labReport.HeartBeatRatio > 100.0,
                (double)labReport.PhLevel < 7.35 || (double)labReport.PhLevel > 7.45
            };

            if (criticalValues.Any(x => x))
                return "critical";

            var highValues = new[]
            {
                (double)labReport.CholesterolLevel > 200.0,
                (double)labReport.SucroseLevel > 140.0,
                (double)labReport.HeartBeatRatio < 70.0 || (double)labReport.HeartBeatRatio > 90.0
            };

            if (highValues.Any(x => x))
                return "high";

            return "medium";
        }

        // Typing Indicators
        public async Task SendTypingIndicator(int receiverId, bool isTyping)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (userId == null) return;

            await Clients.Group($"User_{receiverId}")
                .SendAsync("UserTyping", userId.Value, userName, isTyping);
        }

        // Medical Notifications
        public async Task SendCriticalAlert(CriticalAlertDto alertDto)
        {
            try
            {
                var userId = GetUserId();
                var userType = GetUserType();

                // Only doctors and admins can send critical alerts
                if (userType != "Doctor" && userType != "Admin")
                {
                    await Clients.Caller.SendAsync("AlertError", "Unauthorized to send critical alerts");
                    return;
                }

                var notification = new NotificationDto
                {
                    UserId = alertDto.PatientId,
                    Title = alertDto.Title,
                    Message = alertDto.Message,
                    Type = "medical",
                    Priority = "critical",
                    Timestamp = DateTime.UtcNow,
                    IsRead = false,
                    Data = alertDto.Data
                };

                // Send to patient
                await Clients.Group($"User_{alertDto.PatientId}")
                    .SendAsync("ReceiveNotification", notification);

                // Send to all doctors for awareness
                await Clients.Group("Doctors")
                    .SendAsync("CriticalAlert", notification);

                // Send to admins
                await Clients.Group("Admins")
                    .SendAsync("CriticalAlert", notification);

                _logger.LogWarning($"Critical alert sent by {GetUserName()} for patient {alertDto.PatientId}: {alertDto.Title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending critical alert");
            }
        }

        public async Task SendLabResultNotification(int patientId, int labReportId)
        {
            try
            {
                var labReport = await _labReportService.GetLabReportByIdAsync(labReportId);
                if (labReport == null) return;

                var notification = new NotificationDto
                {
                    UserId = patientId,
                    Title = "New Lab Results Available",
                    Message = $"Your {labReport.TestPerformed} results are now available for review.",
                    Type = "lab_result",
                    Priority = DetermineLabResultPriority(labReport),
                    Timestamp = DateTime.UtcNow,
                    IsRead = false,
                    ActionUrl = $"/lab-reports/{labReportId}",
                    Data = new { LabReportId = labReportId }
                };

                // Send to patient
                await Clients.Group($"User_{patientId}")
                    .SendAsync("ReceiveNotification", notification);

                // If critical results, also notify doctors
                if (notification.Priority == "critical")
                {
                    await Clients.Group("Doctors")
                        .SendAsync("CriticalAlert", notification);
                }

                _logger.LogInformation($"Lab result notification sent to patient {patientId} for report {labReportId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending lab result notification");
            }
        }

        // Group Management
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserJoinedGroup", GetUserName(), groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserLeftGroup", GetUserName(), groupName);
        }

        public async Task SendGroupMessage(string groupName, string message)
        {
            var userName = GetUserName();
            await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", userName, message);
        }

        // User Activity Updates
        public async Task UpdateUserActivity(string activity)
        {
            var userId = GetUserId();
            var userName = GetUserName();

            if (userId != null && _connections.TryGetValue(Context.ConnectionId, out var connection))
            {
                connection.CurrentActivity = activity;
                connection.LastActivity = DateTime.UtcNow;

                await Clients.All.SendAsync("UserPresenceUpdated", new
                {
                    UserId = userId,
                    UserName = userName,
                    IsOnline = true,
                    LastSeen = DateTime.UtcNow,
                    CurrentActivity = activity
                });
            }
        }

        // Helper Methods
        private int? GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private string GetUserName()
        {
            return Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";
        }

        private string GetUserType()
        {
            return Context.User?.FindFirst("UserType")?.Value ?? "Unknown";
        }
    }

    // Supporting Classes
    public class UserConnection
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public DateTime ConnectedAt { get; set; }
        public DateTime? DisconnectedAt { get; set; }
        public bool IsOnline { get; set; }
        public string? CurrentActivity { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public class CriticalAlertDto
    {
        public int PatientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
    }

    public class NotificationDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public object? Data { get; set; }
    }
}
