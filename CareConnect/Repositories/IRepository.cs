using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
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
        Task<CurrentDoctorResult?> GetPhysicianByUserId(long userId);
        Task<string> UpdatePhysician(PhysicianDto physician);
        Task<string> DeletePhysicianByUserID(long userID);
        Task<IEnumerable<SpecialtyResult>> GetAllSpecialty();

        // Personnels
        Task<IEnumerable<PersonnelResult>> GetAllPersonnels();
        Task<string> CreatePersonnel(PersonnelDto personnel);
        Task<string> UpdatePersonnel(PersonnelDto personnel);
        Task<IEnumerable<PersonnelDto>> GetPersonnelByID(long personnelID);
        Task<string> DeletePersonnelByUserID(long userID);
    }
}
