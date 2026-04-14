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
    public class PhysicianTimeOffController(IPhysicianTimeOffService _service) : ControllerBase
    {
        [HttpGet("Admin/PhysicianTimeOff")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianTimeOffResult>>> GetAllPhysicianTimeOff()
        {
            var timeOffEntries = await _service.GetAllPhysicianTimeOff();
            return Ok(timeOffEntries);
        }

        [HttpGet("Admin/PhysicianTimeOff/{physicianId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianTimeOffResult>>> GetPhysicianTimeOffByPhysicianId(
            [FromRoute] long physicianId,
            [FromQuery] DateTime? rangeStart,
            [FromQuery] DateTime? rangeEnd)
        {
            var timeOffEntries = await _service.GetPhysicianTimeOffByPhysicianId(physicianId, rangeStart, rangeEnd);
            return Ok(timeOffEntries);
        }

        [HttpGet("Doctor/MyTimeOff")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<IEnumerable<PhysicianTimeOffResult>>> GetCurrentDoctorTimeOff(
            [FromServices] IService service,
            [FromQuery] DateTime? rangeStart,
            [FromQuery] DateTime? rangeEnd)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var timeOffEntries = await _service.GetPhysicianTimeOffByPhysicianId(physician.Value!.PhysicianId, rangeStart, rangeEnd);
            return Ok(timeOffEntries);
        }

        [HttpPost("Doctor/MyTimeOff")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> CreateCurrentDoctorTimeOff(
            [FromServices] IService service,
            [FromBody] PhysicianTimeOffDto physicianTimeOff)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            physicianTimeOff.PhysicianId = physician.Value!.PhysicianId;

            var result = await _service.CreatePhysicianTimeOff(physicianTimeOff);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.TimeOff });
        }

        [HttpPut("Doctor/MyTimeOff/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> UpdateCurrentDoctorTimeOff(
            [FromServices] IService service,
            [FromRoute] long id,
            [FromBody] PhysicianTimeOffDto physicianTimeOff)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var existingTimeOff = await _service.GetPhysicianTimeOffById(id);
            if (existingTimeOff is null)
            {
                return NotFound(new { message = "Physician time off was not found." });
            }

            if (existingTimeOff.PhysicianId != physician.Value!.PhysicianId)
            {
                return Forbid();
            }

            physicianTimeOff.PhysicianTimeOffId = (int)id;
            physicianTimeOff.PhysicianId = physician.Value.PhysicianId;

            var result = await _service.UpdatePhysicianTimeOff(physicianTimeOff);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.TimeOff });
        }

        [HttpDelete("Doctor/MyTimeOff/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> DeleteCurrentDoctorTimeOff(
            [FromServices] IService service,
            [FromRoute] long id)
        {
            var physician = await ResolveCurrentDoctor(service);
            if (physician.Result is not null)
            {
                return physician.Result;
            }

            var existingTimeOff = await _service.GetPhysicianTimeOffById(id);
            if (existingTimeOff is null)
            {
                return NotFound(new { message = "Physician time off was not found." });
            }

            if (existingTimeOff.PhysicianId != physician.Value!.PhysicianId)
            {
                return Forbid();
            }

            var message = await _service.DeletePhysicianTimeOffById(id);
            return Ok(new { Message = message });
        }

        [HttpPost("Admin/PhysicianTimeOff")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreatePhysicianTimeOff([FromBody] PhysicianTimeOffDto physicianTimeOff)
        {
            var result = await _service.CreatePhysicianTimeOff(physicianTimeOff);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.TimeOff });
        }

        [HttpPut("Admin/PhysicianTimeOff/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePhysicianTimeOff([FromRoute] long id, [FromBody] PhysicianTimeOffDto physicianTimeOff)
        {
            physicianTimeOff.PhysicianTimeOffId = (int)id;

            var result = await _service.UpdatePhysicianTimeOff(physicianTimeOff);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, data = result.TimeOff });
        }

        [HttpDelete("Admin/PhysicianTimeOff/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhysicianTimeOffById([FromRoute] long id)
        {
            var message = await _service.DeletePhysicianTimeOffById(id);
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