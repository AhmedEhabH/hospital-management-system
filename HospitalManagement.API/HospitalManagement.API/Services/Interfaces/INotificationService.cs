namespace HospitalManagement.API.Services.Interfaces
{
    /// <summary>
    /// Service interface for handling various types of notifications
    /// including email, SMS, and real-time notifications for healthcare workflows
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Sends appointment confirmation email to patient
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        /// <returns>Task representing the async operation</returns>
        Task SendAppointmentConfirmationEmailAsync(int appointmentId);

        /// <summary>
        /// Sends appointment reminder email to patient
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        /// <returns>Task representing the async operation</returns>
        Task SendAppointmentReminderEmailAsync(int appointmentId);

        /// <summary>
        /// Sends appointment cancellation notification
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        /// <param name="reason">Cancellation reason</param>
        /// <returns>Task representing the async operation</returns>
        Task SendAppointmentCancellationNotificationAsync(int appointmentId, string reason);

        /// <summary>
        /// Sends critical lab result notification to doctor
        /// </summary>
        /// <param name="labReportId">The lab report ID</param>
        /// <returns>Task representing the async operation</returns>
        Task SendCriticalLabResultNotificationAsync(int labReportId);

        /// <summary>
        /// Schedules appointment reminder job
        /// </summary>
        /// <param name="appointmentId">The appointment ID</param>
        /// <param name="reminderTime">When to send the reminder</param>
        /// <returns>Job ID for tracking</returns>
        string ScheduleAppointmentReminder(int appointmentId, DateTime reminderTime);

        /// <summary>
        /// Cancels a scheduled reminder job
        /// </summary>
        /// <param name="jobId">The job ID to cancel</param>
        /// <returns>True if cancelled successfully</returns>
        bool CancelScheduledReminder(string jobId);
    }
}
