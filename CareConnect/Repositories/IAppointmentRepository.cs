using CareConnect.Models.Dtos;
using CareConnect.Models.Database.results;

namespace CareConnect.Repositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment?> GetAppointmentById(int appointmentId);
        Task<IEnumerable<Appointment>> GetPhysicianAppointments(int physicianId, DateTime rangeStart, DateTime? rangeEnd = null);
        Task<Appointment?> CreateAppointment(Appointment appointment);
        Task<Appointment?> UpdateAppointment(Appointment appointment);
        Task<Appointment?> CancelAppointment(int appointmentId, DateTime updatedAt);
        Task<IEnumerable<PatientBlockingWindowResult>> GetPatientBlockingWindowsByDate(int patientId, DateTime date);
        Task<IEnumerable<PatientAppointmentResult>> GetPatientAppointments(
            int patientId,
            DateTime? fromDateTime = null,
            DateTime? toDateTime = null,
            int? appointmentStatus = null);
        Task<IEnumerable<DoctorDayAppointmentResult>> GetDoctorDayAppointments(int physicianId, DateTime date);
    }
}