using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientDto>> GetAllPatients();
        Task<IEnumerable<PatientDto>> GetPatientByID(long patientID);
        Task<string> DeletePatientByUserID(long userID);
        Task<string> CreatePatient(PatientDto patient);
    }
}
