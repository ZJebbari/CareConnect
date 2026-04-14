using CareConnect.Models.Dtos;
using CareConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentSchedulingController(IAppointmentSchedulingService _service) : ControllerBase
    {
        [HttpPost("Appointment/Schedule")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<ActionResult> ScheduleAppointment([FromBody] Appointment appointment)
        {
            var result = await _service.ScheduleAppointment(appointment);

            if (!result.Success)
            {
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
        [Authorize(Roles = "Admin,Personnel,Doctor")]
        public async Task<ActionResult<IEnumerable<DateTime>>> GetAvailableAppointmentSlots([FromRoute] int physicianId, [FromQuery] DateTime date)
        {
            var availableSlots = await _service.GetAvailableAppointmentSlots(physicianId, date);
            return Ok(availableSlots);
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
    }
}