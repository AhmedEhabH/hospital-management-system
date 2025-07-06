using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Repositories.Interfaces;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using HospitalManagement.API.Hubs;

namespace HospitalManagement.API.Services.Implementations
{
    /// <summary>
    /// Comprehensive notification service for healthcare workflows
    /// Handles email notifications, appointment reminders, and critical alerts
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly ILogger<NotificationService> _logger;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILabReportRepository _labReportRepository;
        private readonly IHubContext<MedicalAlertsHub> _hubContext;

        public NotificationService(
            ILogger<NotificationService> logger,
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            ILabReportRepository labReportRepository,
            IHubContext<MedicalAlertsHub> hubContext)
        {
            _logger = logger;
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _labReportRepository = labReportRepository;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Sends appointment confirmation email to patient
        /// This method will be executed as a background job
        /// </summary>
        public async Task SendAppointmentConfirmationEmailAsync(int appointmentId)
        {
            try
            {
                _logger.LogInformation("Processing appointment confirmation email for appointment {AppointmentId}", appointmentId);

                // Fetch appointment details
                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (appointment == null)
                {
                    _logger.LogWarning("Appointment {AppointmentId} not found for confirmation email", appointmentId);
                    return;
                }

                // Fetch patient and doctor details
                var patient = await _userRepository.GetByIdAsync(appointment.PatientId);
                var doctor = await _userRepository.GetByIdAsync(appointment.DoctorId);

                if (patient == null || doctor == null)
                {
                    _logger.LogWarning("Patient or Doctor not found for appointment {AppointmentId}", appointmentId);
                    return;
                }

                // Simulate email sending (replace with actual email service like SendGrid)
                await SimulateEmailSending(
                    patient.Email,
                    "Appointment Confirmation",
                    GenerateConfirmationEmailContent(appointment, patient, doctor)
                );

                // Send real-time notification via SignalR
                await _hubContext.Clients.Group($"Patient_{patient.Id}")
                    .SendAsync("AppointmentConfirmation", new
                    {
                        AppointmentId = appointmentId,
                        Message = $"Your appointment with Dr. {doctor.FirstName} {doctor.LastName} has been confirmed for {appointment.StartTime:MMM dd, yyyy} at {appointment.StartTime:HH:mm}",
                        Type = "Success"
                    });

                _logger.LogInformation("Appointment confirmation email sent successfully for appointment {AppointmentId}", appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment confirmation email for appointment {AppointmentId}", appointmentId);
                throw;
            }
        }

        /// <summary>
        /// Sends appointment reminder email to patient
        /// Typically scheduled 24 hours before appointment
        /// </summary>
        public async Task SendAppointmentReminderEmailAsync(int appointmentId)
        {
            try
            {
                _logger.LogInformation("Processing appointment reminder email for appointment {AppointmentId}", appointmentId);

                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (appointment == null || appointment.Status == "Cancelled")
                {
                    _logger.LogInformation("Appointment {AppointmentId} not found or cancelled, skipping reminder", appointmentId);
                    return;
                }

                var patient = await _userRepository.GetByIdAsync(appointment.PatientId);
                var doctor = await _userRepository.GetByIdAsync(appointment.DoctorId);

                if (patient == null || doctor == null)
                {
                    _logger.LogWarning("Patient or Doctor not found for appointment reminder {AppointmentId}", appointmentId);
                    return;
                }

                // Send reminder email
                await SimulateEmailSending(
                    patient.Email,
                    "Appointment Reminder - Tomorrow",
                    GenerateReminderEmailContent(appointment, patient, doctor)
                );

                // Send real-time notification
                await _hubContext.Clients.Group($"Patient_{patient.Id}")
                    .SendAsync("AppointmentReminder", new
                    {
                        AppointmentId = appointmentId,
                        Message = $"Reminder: You have an appointment with Dr. {doctor.FirstName} {doctor.LastName} tomorrow at {appointment.StartTime:HH:mm}",
                        Type = "Info"
                    });

                _logger.LogInformation("Appointment reminder sent successfully for appointment {AppointmentId}", appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment reminder for appointment {AppointmentId}", appointmentId);
                throw;
            }
        }

        /// <summary>
        /// Sends appointment cancellation notification
        /// </summary>
        public async Task SendAppointmentCancellationNotificationAsync(int appointmentId, string reason)
        {
            try
            {
                _logger.LogInformation("Processing appointment cancellation notification for appointment {AppointmentId}", appointmentId);

                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (appointment == null)
                {
                    _logger.LogWarning("Appointment {AppointmentId} not found for cancellation notification", appointmentId);
                    return;
                }

                var patient = await _userRepository.GetByIdAsync(appointment.PatientId);
                var doctor = await _userRepository.GetByIdAsync(appointment.DoctorId);

                if (patient != null)
                {
                    await SimulateEmailSending(
                        patient.Email,
                        "Appointment Cancelled",
                        GenerateCancellationEmailContent(appointment, patient, doctor!, reason)
                    );

                    // Real-time notification
                    await _hubContext.Clients.Group($"Patient_{patient.Id}")
                        .SendAsync("AppointmentCancellation", new
                        {
                            AppointmentId = appointmentId,
                            Message = $"Your appointment scheduled for {appointment.StartTime:MMM dd, yyyy} has been cancelled. {reason}",
                            Type = "Warning"
                        });
                }

                _logger.LogInformation("Appointment cancellation notification sent for appointment {AppointmentId}", appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment cancellation notification for appointment {AppointmentId}", appointmentId);
                throw;
            }
        }

        /// <summary>
        /// Sends critical lab result notification to doctor
        /// </summary>
        public async Task SendCriticalLabResultNotificationAsync(int labReportId)
        {
            try
            {
                _logger.LogInformation("Processing critical lab result notification for lab report {LabReportId}", labReportId);

                var labReport = await _labReportRepository.GetByIdAsync(labReportId);
                if (labReport == null)
                {
                    _logger.LogWarning("Lab report {LabReportId} not found for critical notification", labReportId);
                    return;
                }

                var patient = await _userRepository.GetByIdAsync(labReport.PatientId);
                if (patient == null)
                {
                    _logger.LogWarning("Patient not found for lab report {LabReportId}", labReportId);
                    return;
                }

                // Find all doctors to notify (in a real system, you'd have doctor assignments)
                var doctors = await _userRepository.GetByConditionAsync(u => u.UserType == "Doctor");

                foreach (var doctor in doctors)
                {
                    // Send email to doctor
                    await SimulateEmailSending(
                        doctor.Email,
                        "CRITICAL: Lab Result Alert",
                        GenerateCriticalLabAlertContent(labReport, patient, doctor)
                    );

                    // Real-time notification
                    await _hubContext.Clients.Group($"Doctor_{doctor.Id}")
                        .SendAsync("CriticalLabAlert", new
                        {
                            LabReportId = labReportId,
                            PatientName = $"{patient.FirstName} {patient.LastName}",
                            Message = $"CRITICAL lab results for {patient.FirstName} {patient.LastName} require immediate attention",
                            Type = "Critical",
                            Priority = "High"
                        });
                }

                _logger.LogInformation("Critical lab result notifications sent for lab report {LabReportId}", labReportId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending critical lab result notification for lab report {LabReportId}", labReportId);
                throw;
            }
        }

        /// <summary>
        /// Schedules appointment reminder job using Hangfire
        /// </summary>
        public string ScheduleAppointmentReminder(int appointmentId, DateTime reminderTime)
        {
            try
            {
                var jobId = BackgroundJob.Schedule<INotificationService>(
                    service => service.SendAppointmentReminderEmailAsync(appointmentId),
                    reminderTime
                );

                _logger.LogInformation("Scheduled appointment reminder job {JobId} for appointment {AppointmentId} at {ReminderTime}",
                    jobId, appointmentId, reminderTime);

                return jobId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling appointment reminder for appointment {AppointmentId}", appointmentId);
                throw;
            }
        }

        /// <summary>
        /// Cancels a scheduled reminder job
        /// </summary>
        public bool CancelScheduledReminder(string jobId)
        {
            try
            {
                var result = BackgroundJob.Delete(jobId);
                _logger.LogInformation("Cancelled scheduled reminder job {JobId}: {Result}", jobId, result);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scheduled reminder job {JobId}", jobId);
                return false;
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// Simulates email sending (replace with actual email service)
        /// </summary>
        private async Task SimulateEmailSending(string toEmail, string subject, string content)
        {
            // Simulate network delay
            await Task.Delay(1000);

            _logger.LogInformation("EMAIL SENT - To: {Email}, Subject: {Subject}", toEmail, subject);
            _logger.LogDebug("Email Content: {Content}", content);

            // In a real implementation, you would use a service like:
            // - SendGrid
            // - Amazon SES
            // - Azure Communication Services
            // - MailKit/SmtpClient
        }

        private string GenerateConfirmationEmailContent(dynamic appointment, dynamic patient, dynamic doctor)
        {
            return $@"
Dear {patient.FirstName} {patient.LastName},

Your appointment has been confirmed with the following details:

Doctor: Dr. {doctor.FirstName} {doctor.LastName}
Date: {appointment.StartTime:dddd, MMMM dd, yyyy}
Time: {appointment.StartTime:h:mm tt} - {appointment.EndTime:h:mm tt}
Type: {appointment.Title}

Please arrive 15 minutes early for your appointment.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
Hospital Management Team
";
        }

        private string GenerateReminderEmailContent(dynamic appointment, dynamic patient, dynamic doctor)
        {
            return $@"
Dear {patient.FirstName} {patient.LastName},

This is a reminder that you have an appointment scheduled for tomorrow:

Doctor: Dr. {doctor.FirstName} {doctor.LastName}
Date: {appointment.StartTime:dddd, MMMM dd, yyyy}
Time: {appointment.StartTime:h:mm tt} - {appointment.EndTime:h:mm tt}
Type: {appointment.Title}

Please remember to:
- Arrive 15 minutes early
- Bring a valid ID and insurance card
- Bring any relevant medical records or test results

If you need to reschedule or cancel, please contact us immediately.

Best regards,
Hospital Management Team
";
        }

        private string GenerateCancellationEmailContent(dynamic appointment, dynamic patient, dynamic doctor, string reason)
        {
            return $@"
Dear {patient.FirstName} {patient.LastName},

We regret to inform you that your appointment has been cancelled:

Doctor: Dr. {doctor.FirstName} {doctor.LastName}
Original Date: {appointment.StartTime:dddd, MMMM dd, yyyy}
Original Time: {appointment.StartTime:h:mm tt} - {appointment.EndTime:h:mm tt}

Reason: {reason}

Please contact us to reschedule your appointment at your earliest convenience.

We apologize for any inconvenience this may cause.

Best regards,
Hospital Management Team
";
        }

        private string GenerateCriticalLabAlertContent(dynamic labReport, dynamic patient, dynamic doctor)
        {
            return $@"
CRITICAL LAB RESULT ALERT

Dr. {doctor.FirstName} {doctor.LastName},

A critical lab result requires your immediate attention:

Patient: {patient.FirstName} {patient.LastName}
Test: {labReport.TestPerformed}
Date Tested: {labReport.TestedDate:dddd, MMMM dd, yyyy}

Critical Values Detected:
- Cholesterol Level: {labReport.CholesterolLevel} mg/dL
- pH Level: {labReport.PhLevel}
- Blood Sugar: {labReport.SucroseLevel} mg/dL

Please review the complete lab report and contact the patient immediately if necessary.

This is an automated alert from the Hospital Management System.
";
        }

        #endregion
    }
}
