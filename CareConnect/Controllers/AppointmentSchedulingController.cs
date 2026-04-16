using CareConnect.Models.Dtos;
using CareConnect.Models.Database.results;
using CareConnect.Services;
using CareConnect.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentSchedulingController(IAppointmentSchedulingService _service, IUserService _userService, IService _careConnectService) : ControllerBase
    {
        [HttpPost("Appointment/Schedule")]
        [Authorize(Roles = "Admin,Personnel,Patient")]
        public async Task<ActionResult> ScheduleAppointment([FromBody] Appointment appointment)
        {
            if (User.IsInRole("Patient"))
            {
                var userId = CurrentUserHelper.GetUserId(User);
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                var patientId = await _userService.ResolvePatientIdByUserIdAsync(userId.Value);
                if (!patientId.HasValue)
                {
                    return BadRequest(new { message = "Patient profile was not found for authenticated user." });
                }

                appointment.PatientId = patientId.Value;
            }

            var result = await _service.ScheduleAppointment(appointment);

            if (!result.Success)
            {
                if (IsConflictMessage(result.Message))
                {
                    return Conflict(new { message = result.Message });
                }

                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Appointment });
        }

        [HttpPut("Appointment/{id}")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<ActionResult> UpdateAppointment([FromRoute] int id, [FromBody] Appointment appointment)
        {
            appointment.AppointmentId = id;

            var result = await _service.UpdateAppointment(appointment);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Appointment });
        }

        [HttpDelete("Appointment/{id}")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<ActionResult> CancelAppointment([FromRoute] int id)
        {
            var result = await _service.CancelAppointment(id);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Appointment });
        }

        [HttpGet("Appointment/Availability/{physicianId}")]
        [Authorize(Roles = "Admin,Personnel,Doctor,Patient")]
        public async Task<ActionResult<IEnumerable<DateTime>>> GetAvailableAppointmentSlots([FromRoute] int physicianId, [FromQuery] string date, [FromQuery] int? patientId = null)
        {
            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var bookingDay))
            {
                return BadRequest(new { message = "Date must be provided in yyyy-MM-dd format." });
            }

            var normalizedBookingDayUtc = DateTime.SpecifyKind(bookingDay.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

            int? resolvedPatientId = patientId;

            if (User.IsInRole("Patient"))
            {
                var userId = CurrentUserHelper.GetUserId(User);
                if (!userId.HasValue)
                {
                    return Unauthorized();
                }

                resolvedPatientId = await _userService.ResolvePatientIdByUserIdAsync(userId.Value);
                if (!resolvedPatientId.HasValue)
                {
                    return BadRequest(new { message = "Patient profile was not found for authenticated user." });
                }
            }

            var availableSlots = await _service.GetAvailableAppointmentSlots(physicianId, normalizedBookingDayUtc, resolvedPatientId);
            return Ok(availableSlots);
        }

        [HttpGet("Doctor/MyAppointments")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<IEnumerable<DoctorDayAppointmentResult>>> GetCurrentDoctorAppointmentsByDay([FromQuery] string date)
        {
            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var bookingDay))
            {
                return BadRequest(new { message = "Date must be provided in yyyy-MM-dd format." });
            }

            var userId = CurrentUserHelper.GetUserId(User);
            if (!userId.HasValue)
            {
                return Unauthorized();
            }

            var physician = await _careConnectService.GetPhysicianByUserId(userId.Value);
            if (physician is null)
            {
                return NotFound(new { message = "Doctor profile was not found." });
            }

            var normalizedBookingDayUtc = DateTime.SpecifyKind(bookingDay.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var appointments = await _service.GetDoctorDayAppointments(physician.PhysicianId, normalizedBookingDayUtc);
            return Ok(appointments);
        }

        [HttpGet("Appointment/Validate")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<ActionResult> ValidateAppointmentAvailability([FromQuery] int physicianId, [FromQuery] DateTime appointmentTime)
        {
            var result = await _service.ValidateAppointmentAvailability(physicianId, appointmentTime);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        [HttpGet("Patient/MyAppointments")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult> GetCurrentPatientUpcomingAppointments()
        {
            var result = await _service.GetUpcomingAppointmentsForCurrentPatient();

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Appointments });
        }

        [HttpDelete("Patient/MyAppointments/{id}")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult> CancelCurrentPatientAppointment([FromRoute] int id)
        {
            var result = await _service.CancelCurrentPatientAppointment(id);

            if (!result.Success)
            {
                if (result.Message.Equals("You are not authorized to cancel this appointment.", StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }

                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Appointment });
        }

        private static bool IsConflictMessage(string message)
        {
            return message.Equals("Selected time slot is no longer available for this doctor.", StringComparison.OrdinalIgnoreCase)
                || message.Equals("Patient already has a scheduled appointment with this doctor on the selected day.", StringComparison.OrdinalIgnoreCase)
                || message.Equals("Patient has another scheduled appointment within 60 minutes of the selected time.", StringComparison.OrdinalIgnoreCase);
        }
    }
}