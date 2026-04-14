using CareConnect.Common;
using CareConnect.Models.Dtos;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class AppointmentRepository(CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IAppointmentRepository
    {
        public async Task<Appointment?> GetAppointmentById(int appointmentId)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<Appointment>(
                "dbo.GetAppointmentById",
                new { AppointmentId = appointmentId },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<IEnumerable<Appointment>> GetPhysicianAppointments(int physicianId, DateTime rangeStart, DateTime? rangeEnd = null)
        {
            var result = await Connection.QueryAsync<Appointment>(
                "dbo.GetPhysicianAppointments",
                new
                {
                    PhysicianId = physicianId,
                    RangeStart = rangeStart,
                    RangeEnd = rangeEnd
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<Appointment?> CreateAppointment(Appointment appointment)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<Appointment>(
                "dbo.CreateAppointment",
                new
                {
                    appointment.PatientId,
                    appointment.PhysicianId,
                    appointment.TypeId,
                    AppointmentStatus = appointment.AppointmentStatus ?? true,
                    appointment.AppointmentTime,
                    CreatedAt = appointment.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = appointment.UpdatedAt
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<Appointment?> UpdateAppointment(Appointment appointment)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<Appointment>(
                "dbo.UpdateAppointment",
                new
                {
                    appointment.AppointmentId,
                    appointment.PatientId,
                    appointment.PhysicianId,
                    appointment.TypeId,
                    AppointmentStatus = appointment.AppointmentStatus ?? true,
                    appointment.AppointmentTime,
                    UpdatedAt = appointment.UpdatedAt ?? DateTime.UtcNow
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<Appointment?> CancelAppointment(int appointmentId, DateTime updatedAt)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<Appointment>(
                "dbo.CancelAppointment",
                new
                {
                    AppointmentId = appointmentId,
                    UpdatedAt = updatedAt
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }
    }
}