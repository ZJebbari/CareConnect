using CareConnect.Models.Database.results;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Repositories
{
    public interface IRepository
    {
        // Patients
        Task<IEnumerable<PatientResult>> GetAllPatients();
        Task<string> UpdatePatient(PatientDto patient);
        Task<IEnumerable<PatientDto>> GetPatientByID(long patientID);
        Task<string> DeletePatientByUserID(long userID);
        Task<string> CreatePatient(PatientDto patient);

        // Physicians
        Task<IEnumerable<PhysicianResult>> GetAllPhysicians();
    }
}
