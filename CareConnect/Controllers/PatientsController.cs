using CareConnect.Models;
using CareConnect.Models.Database.results;
using CareConnect.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController(IPatientService _patientService) : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientResult>>> GetAllPatients()
        {
            var patients = await _patientService.GetAllPatients();
            return Ok(patients);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdatePatient([FromBody] PatientDto patient)
        {
            var result = await _patientService.UpdatePatient(patient);
            return Ok(result);
        }

        [HttpGet("{id}")]
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

