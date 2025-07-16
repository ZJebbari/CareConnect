using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Repositories
{
    public interface IPatientRepository
    {
        Task<IEnumerable<PatientDto>> GetAllPatients();
        Task<IEnumerable<PatientDto>> GetPatientByID(long patientID);
        Task<string> DeletePatientByUserID(long userID);
        Task<string> CreatePatient(PatientDto patient);
    }
}
