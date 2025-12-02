using CareConnect.Models;
using CareConnect.Models.Database.results;
using CareConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CareConnectController(IService _service) : ControllerBase
    {

        [HttpGet("Admin/Patients")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PatientResult>>> GetAllPatients()
        {
            var patients = await _service.GetAllPatients();
            return Ok(patients);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePatient([FromBody] PatientDto patient)
        {
            var result = await _service.UpdatePatient(patient);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatientByID([FromQuery] long patientID)
        {
            var patient = await _service.GetPatientByID(patientID);
            return Ok(patient);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatientByUserID([FromRoute] long id)
        {
            var message = await _service.DeletePatientByUserID(id);
            return Ok(new { Message = message });
        }

        [HttpPost]
        public async Task<string> CreatePatient(PatientDto patient)
        {
            return await _service.CreatePatient(patient);
        }

        [HttpGet("Admin/Physicians")]
        public async Task<ActionResult<IEnumerable<PhysicianResult>>> GetAllPhysicians()
        {
            var result =  await _service.GetAllPhysicians();

            if (result == null)
            {
                return NotFound("No physician found.");
            }
            return Ok(result);
        }


    }
}

