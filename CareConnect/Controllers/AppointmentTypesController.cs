using CareConnect.Models.Database.results;
using CareConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentTypesController(IAppointmentTypeService _service) : ControllerBase
    {
        [HttpGet("Admin/AppointmentTypes")]
        [Authorize(Roles = "Admin,Personnel")]
        public async Task<ActionResult<IEnumerable<AppointmentTypeResult>>> GetAllAppointmentTypes()
        {
            var appointmentTypes = await _service.GetAllAppointmentTypes();
            return Ok(appointmentTypes);
        }

        [HttpGet("Patient/Booking/AppointmentTypes")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<IEnumerable<AppointmentTypeResult>>> GetPatientBookingAppointmentTypes()
        {
            var appointmentTypes = await _service.GetAllAppointmentTypes();
            return Ok(appointmentTypes);
        }
    }
}