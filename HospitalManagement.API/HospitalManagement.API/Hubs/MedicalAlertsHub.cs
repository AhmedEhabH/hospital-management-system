using HospitalManagement.API.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Runtime.Versioning;

namespace HospitalManagement.API.Hubs
{
    [Authorize]
    public class MedicalAlertsHub : Hub
    {
        private readonly ILogger<MedicalAlertsHub> _logger;
        private static readonly Dictionary<string, HubUserConnection> _connections = new();

        public MedicalAlertsHub(ILogger<MedicalAlertsHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinUserGroup(string userId, string userType)
        {
            var connectionId = Context.ConnectionId;
            var userConnection = new HubUserConnection // Fixed: Use custom class name
            {
                UserId = userId,
                UserType = userType,
                ConnectionId = connectionId,
                ConnectedAt = DateTime.UtcNow
            };

            _connections[connectionId] = userConnection;

            // Join role-based groups
            await Groups.AddToGroupAsync(connectionId, $"UserType_{userType}");
            await Groups.AddToGroupAsync(connectionId, $"User_{userId}");

            _logger.LogInformation("User {UserId} ({UserType}) connected with connection {ConnectionId}",
                userId, userType, connectionId);

            // Notify admins about new connection
            await Clients.Group("UserType_Admin").SendAsync("UserConnected", new
            {
                UserId = userId,
                UserType = userType,
                ConnectedAt = DateTime.UtcNow
            });
        }

        public async Task SendCriticalAlert(CriticalAlertDto alert)
        {
            _logger.LogWarning("Critical medical alert: {AlertMessage} for Patient {PatientId}",
                alert.Message, alert.PatientId); // Fixed: Use correct property name

            // Send to all doctors and admins
            await Clients.Groups("UserType_Doctor", "UserType_Admin")
                .SendAsync("CriticalMedicalAlert", alert);

            // Send to specific patient
            await Clients.Group($"User_{alert.PatientId}")
                .SendAsync("PersonalMedicalAlert", alert);
        }

        public async Task SendAppointmentReminder(AppointmentReminderDto reminder)
        {
            _logger.LogInformation("Sending appointment reminder to Patient {PatientId}",
                reminder.PatientId);

            await Clients.Group($"User_{reminder.PatientId}")
                .SendAsync("AppointmentReminder", reminder);
        }

        public async Task SendSystemNotification(SystemNotificationDto notification)
        {
            _logger.LogInformation("Broadcasting system notification: {Message}",
                notification.Message);

            // Send to all connected users
            await Clients.All.SendAsync("SystemNotification", notification);
        }

        //[SupportedOSPlatform("windows")]
        public List<OnlineUserDto> GetOnlineUsers()
        {
            var onlineUsers = _connections.Values
                .GroupBy(c => c.UserId)
                .Select(g => new OnlineUserDto
                {
                    UserId = g.Key,
                    UserType = g.First().UserType,
                    ConnectionCount = g.Count(),
                    LastSeen = g.Max(c => c.ConnectedAt)
                })
                .ToList();

            return onlineUsers;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;

            if (_connections.TryGetValue(connectionId, out var userConnection))
            {
                _connections.Remove(connectionId);

                _logger.LogInformation("User {UserId} disconnected", userConnection.UserId); // Fixed: Use correct property

                // Notify admins about disconnection
                await Clients.Group("UserType_Admin").SendAsync("UserDisconnected", new
                {
                    UserId = userConnection.UserId,
                    UserType = userConnection.UserType,
                    DisconnectedAt = DateTime.UtcNow
                });
            }

            await base.OnDisconnectedAsync(exception);
        }
    }

    // Fixed: Create custom class to avoid ambiguity with System.Data.SqlClient.UserConnection
    public class HubUserConnection
    {
        public string UserId { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public DateTime ConnectedAt { get; set; }
    }
}
