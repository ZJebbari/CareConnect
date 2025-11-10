using CareConnect.Models.Database.results;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientResult>> GetAllPatients();
        Task<IEnumerable<PatientDto>> GetPatientByID(long patientID);
        Task<string> DeletePatientByUserID(long userID);
        Task<string> UpdatePatient(PatientDto patient);
        Task<string> CreatePatient(PatientDto patient);
    }
}
