using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using CareConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareConnect.Common;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PhysicianSchedulesController(IPhysicianScheduleService _service) : ControllerBase
    {
        [HttpGet("Admin/PhysicianSchedules")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianScheduleResult>>> GetAllPhysicianSchedules()
        {
            var schedules = await _service.GetAllPhysicianSchedules();
            return Ok(schedules);
        }

        [HttpGet("Admin/PhysicianSchedules/{physicianId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianScheduleResult>>> GetPhysicianSchedulesByPhysicianId(
            [FromRoute] long physicianId,
            [FromQuery] DateTime? asOfDate,
            [FromQuery] bool activeOnly = true)
        {
            var schedules = await _service.GetPhysicianSchedulesByPhysicianId(physicianId, asOfDate, activeOnly);
            return Ok(schedules);
        }

        [HttpGet("Doctor/MySchedules")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianScheduleResult>>> GetCurrentDoctorSchedules(
            [FromServices] IService service,
            [FromQuery] DateTime? asOfDate,
            [FromQuery] bool activeOnly = true)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var schedules = await _service.GetPhysicianSchedulesByPhysicianId(physician.Value!.PhysicianId, asOfDate, activeOnly);
            return Ok(schedules);
        }

        [HttpPost("Doctor/MySchedules")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> CreateCurrentDoctorSchedule(
            [FromServices] IService service,
            [FromBody] PhysicianScheduleDto physicianSchedule)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            physicianSchedule.PhysicianId = physician.Value!.PhysicianId;

            var result = await _service.CreatePhysicianSchedule(physicianSchedule);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Schedule });
        }

        [HttpPut("Doctor/MySchedules/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> UpdateCurrentDoctorSchedule(
            [FromServices] IService service,
            [FromRoute] long id,
            [FromBody] PhysicianScheduleDto physicianSchedule)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var existingSchedule = await _service.GetPhysicianScheduleById(id);
            if (existingSchedule is null)
            {
                return NotFound(new { message = "Physician schedule was not found." });
            }

            if (existingSchedule.PhysicianId != physician.Value!.PhysicianId)
            {
                return Forbid();
            }

            physicianSchedule.PhysicianScheduleId = (int)id;
            physicianSchedule.PhysicianId = physician.Value.PhysicianId;

            var result = await _service.UpdatePhysicianSchedule(physicianSchedule);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Schedule });
        }

        [HttpDelete("Doctor/MySchedules/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteCurrentDoctorSchedule(
            [FromServices] IService service,
            [FromRoute] long id)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var existingSchedule = await _service.GetPhysicianScheduleById(id);
            if (existingSchedule is null)
            {
                return NotFound(new { message = "Physician schedule was not found." });
            }

            if (existingSchedule.PhysicianId != physician.Value!.PhysicianId)
            {
                return Forbid();
            }

            var message = await _service.DeletePhysicianScheduleById(id);
            return Ok(new { Message = message });
        }

        [HttpPost("Admin/PhysicianSchedules")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreatePhysicianSchedule([FromBody] PhysicianScheduleDto physicianSchedule)
        {
            var result = await _service.CreatePhysicianSchedule(physicianSchedule);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Schedule });
        }

        [HttpPut("Admin/PhysicianSchedules/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePhysicianSchedule([FromRoute] long id, [FromBody] PhysicianScheduleDto physicianSchedule)
        {
            physicianSchedule.PhysicianScheduleId = (int)id;

            var result = await _service.UpdatePhysicianSchedule(physicianSchedule);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.Schedule });
        }

        [HttpDelete("Admin/PhysicianSchedules/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhysicianScheduleById([FromRoute] long id)
        {
            var message = await _service.DeletePhysicianScheduleById(id);
            return Ok(new { Message = message });
        }

        private async Task<(CurrentDoctorResult? Value, ActionResult? Result)> ResolveCurrentDoctor(IService service)
        {
            var userId = CurrentUserHelper.GetUserId(User);

            if (!userId.HasValue)
            {
                return (null, Unauthorized());
            }

            var physician = await service.GetPhysicianByUserId(userId.Value);
            if (physician is null)
            {
                return (null, NotFound(new { message = "Doctor profile was not found." }));
            }

            return (physician, null);
        }
    }
}