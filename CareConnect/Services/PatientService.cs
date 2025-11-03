
using CareConnect.Models.Database.results;
using CareConnect.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Services
{
    public class PatientService(IPatientRepository _patientRepository) : IPatientService
    {
        public async Task<IEnumerable<PatientResult>> GetAllPatients()
        {
            return await _patientRepository.GetAllPatients();
        }

        public async Task<IEnumerable<PatientDto>> GetPatientByID(long patientID)
        {
            return await _patientRepository.GetPatientByID(patientID);
        }

        public async Task<string> DeletePatientByUserID(long patientID)
        {
            return await _patientRepository.DeletePatientByUserID(patientID);
        }

        public async Task<string> CreatePatient([FromForm] PatientDto patient)
        {
            return await _patientRepository.CreatePatient(patient);
        }
    }
}
