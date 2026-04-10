using CareConnect.Models;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
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

        [HttpPut("Admin/Patients/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePatient([FromBody] PatientDto patient)
        {
            var result = await _service.UpdatePatient(patient);
            return Ok(result);
        }

        [HttpGet("Admin/Patients/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatientByID([FromQuery] long patientID)
        {
            var patient = await _service.GetPatientByID(patientID);
            return Ok(patient);
        }

        [HttpDelete("Admin/Patients/{id}")]
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

        [HttpPut("Admin/Physicians/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePhysician([FromBody] PhysicianDto physician)
        {
            var result = await _service.UpdatePhysician(physician);
            return Ok(result);
        }

        [HttpDelete("Admin/Physicians/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePhysicianByUserID([FromRoute] long id)
        {
            var message = await _service.DeletePhysicianByUserID(id);
            return Ok(new { Message = message });
        }

        [HttpGet("Admin/Specialty")]
        public async Task<ActionResult<IEnumerable<SpecialtyResult>>> GetAllSpecialty()
        {
            var result = await _service.GetAllSpecialty();

            if (result == null)
            {
                return NotFound("No specialty found.");
            }
            return Ok(result);
        }

        [HttpGet("Admin/Personnels")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PersonnelResult>>> GetAllPersonnels()
        {
            var personnels = await _service.GetAllPersonnels();
            return Ok(personnels);
        }

        [HttpPost("Admin/Personnels")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreatePersonnel([FromBody] PersonnelDto personnel)
        {
            var result = await _service.CreatePersonnel(personnel);
            return Ok(result);
        }

        [HttpPut("Admin/Personnels/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdatePersonnel([FromBody] PersonnelDto personnel)
        {
            var result = await _service.UpdatePersonnel(personnel);
            return Ok(result);
        }

        [HttpGet("Admin/Personnels/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetPersonnelByID([FromQuery] long personnelID)
        {
            var personnel = await _service.GetPersonnelByID(personnelID);
            return Ok(personnel);
        }

        [HttpDelete("Admin/Personnels/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePersonnelByUserID([FromRoute] long id)
        {
            var message = await _service.DeletePersonnelByUserID(id);
            return Ok(new { Message = message });
        }

    }
}

