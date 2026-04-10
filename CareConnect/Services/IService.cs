using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Services
{
    public interface IService
    {

        // Patients
        Task<IEnumerable<PatientResult>> GetAllPatients();
        Task<IEnumerable<PatientDto>> GetPatientByID(long patientID);
        Task<string> DeletePatientByUserID(long userID);
        Task<string> UpdatePatient(PatientDto patient);
        Task<string> CreatePatient(PatientDto patient);

        // Physicians
        Task<IEnumerable<PhysicianResult>> GetAllPhysicians();
        Task<string> UpdatePhysician(PhysicianDto physician);
        Task<string> DeletePhysicianByUserID(long userID);
        Task<IEnumerable<SpecialtyResult>> GetAllSpecialty();

        // Personnels
        Task<IEnumerable<PersonnelResult>> GetAllPersonnels();
        Task<string> CreatePersonnel(PersonnelDto personnel);
        Task<IEnumerable<PersonnelDto>> GetPersonnelByID(long personnelID);
        Task<string> DeletePersonnelByUserID(long userID);
        Task<string> UpdatePersonnel(PersonnelDto personnel);
    }
}
