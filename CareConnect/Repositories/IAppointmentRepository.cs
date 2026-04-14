using CareConnect.Models.Dtos;

namespace CareConnect.Repositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment?> GetAppointmentById(int appointmentId);
        Task<IEnumerable<Appointment>> GetPhysicianAppointments(int physicianId, DateTime rangeStart, DateTime? rangeEnd = null);
        Task<Appointment?> CreateAppointment(Appointment appointment);
        Task<Appointment?> UpdateAppointment(Appointment appointment);
        Task<Appointment?> CancelAppointment(int appointmentId, DateTime updatedAt);
    }
}