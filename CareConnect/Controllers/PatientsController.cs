using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CareConnect.Models;
using CareConnect.Services;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController(IPatientService _patientService) : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetAllPatients()
        {
            var patients = await _patientService.GetAllPatients();
            return Ok(patients);
        }

        [HttpGet("id")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatientByID([FromQuery] long patientID)
        {
            var patient = await _patientService.GetPatientByID(patientID);
            return Ok(patient);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatientByUserID([FromRoute] long id)
        {
            var message = await _patientService.DeletePatientByUserID(id);
            return Ok(new { Message = message });
        }

        [HttpPost]
        public async Task<string> CreatePatient(PatientDto patient)
        {
            return await _patientService.CreatePatient(patient);
        }


    }
}

