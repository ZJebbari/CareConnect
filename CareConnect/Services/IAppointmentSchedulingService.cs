using CareConnect.Models.Dtos;
using CareConnect.Models.Database.results;

namespace CareConnect.Services
{
    public interface IAppointmentSchedulingService
    {
        Task<(bool Success, string Message, Appointment? Appointment)> ScheduleAppointment(Appointment appointment);
        Task<(bool Success, string Message, Appointment? Appointment)> UpdateAppointment(Appointment appointment);
        Task<(bool Success, string Message, Appointment? Appointment)> CancelAppointment(int appointmentId);
        Task<(bool Success, string Message)> ValidateAppointmentAvailability(int physicianId, DateTime appointmentTime);
        Task<IEnumerable<DateTime>> GetAvailableAppointmentSlots(int physicianId, DateTime date, int? patientId = null);
        Task<IEnumerable<DoctorDayAppointmentResult>> GetDoctorDayAppointments(int physicianId, DateTime date);
        Task<(bool Success, string Message, IEnumerable<PatientAppointmentResult> Appointments)> GetUpcomingAppointmentsForCurrentPatient();
        Task<(bool Success, string Message, Appointment? Appointment)> CancelCurrentPatientAppointment(int appointmentId);
        Task<bool> HasConflictingAppointmentsForScheduleAsync(PhysicianScheduleDto physicianSchedule);
        Task<bool> HasConflictingAppointmentsForTimeOffAsync(PhysicianTimeOffDto physicianTimeOff);
    }
}