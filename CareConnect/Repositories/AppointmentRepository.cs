using CareConnect.Common;
using CareConnect.Models.Database.results;
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
                "dbo.usp_Appointment_ValidateAndCreate",
                new
                {
                    PatientID = appointment.PatientId,
                    PhysicianID = appointment.PhysicianId,
                    TypeID = appointment.TypeId,
                    AppointmentTime = appointment.AppointmentTime
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
                    AppointmentStatus = appointment.AppointmentStatus ?? 1,
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

        public async Task<IEnumerable<PatientBlockingWindowResult>> GetPatientBlockingWindowsByDate(int patientId, DateTime date)
        {
            var result = await Connection.QueryAsync<PatientBlockingWindowResult>(
                "dbo.usp_Appointment_GetPatientBlockingWindowsByDate",
                new
                {
                    PatientID = patientId,
                    Date = date.Date
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<IEnumerable<PatientAppointmentResult>> GetPatientAppointments(
            int patientId,
            DateTime? fromDateTime = null,
            DateTime? toDateTime = null,
            int? appointmentStatus = null)
        {
            var result = await Connection.QueryAsync<PatientAppointmentResult>(
                "dbo.usp_Appointment_GetByPatientID",
                new
                {
                    PatientID = patientId,
                    FromDateTime = fromDateTime,
                    ToDateTime = toDateTime,
                    AppointmentStatus = appointmentStatus
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<IEnumerable<DoctorDayAppointmentResult>> GetDoctorDayAppointments(int physicianId, DateTime date)
        {
            var result = await Connection.QueryAsync<DoctorDayAppointmentResult>(
                "dbo.usp_Appointment_GetDoctorDayAppointments",
                new
                {
                    PhysicianID = physicianId,
                    Date = date.Date
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }
    }
}