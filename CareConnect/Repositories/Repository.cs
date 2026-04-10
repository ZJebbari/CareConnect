using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace CareConnect.Repositories
{
    public class Repository (CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IRepository
    {
        public async Task<IEnumerable<PatientResult>> GetAllPatients()
        {
            var result = await Connection.QueryAsync<PatientResult>(
                "usp_Patient_GetAll",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> UpdatePatient(PatientDto patient)
        {
            var result = await Connection.QuerySingleAsync<string>(
                "usp_Patient_Update",
                new
                {
                    UserID = patient.UserId,
                    FullName = patient.FullName,
                    Email = patient.Email,
                    Phone = patient.Phone,
                    DateOfBirth = patient.DateOfBirth,
                    Address = patient.Address,
                    Gender = patient.Gender

                },
                 commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<IEnumerable<PatientDto>> GetPatientByID(long patientID)
        {
            var result = await Connection.QueryAsync<PatientDto>(
                "GetPatientByID",
                new { PatientID = patientID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<string> DeletePatientByUserID(long userID)
        {
            var result = await Connection.QueryAsync<string>(
                "dbo.usp_Patient_DeleteByUserID",
                new { UserID = userID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result.FirstOrDefault() ?? "No message returned from stored procedure.";
        }

        public async Task<string> CreatePatient(PatientDto parms)
        {
            var result = await Connection.QuerySingleAsync<PatientCreationResult>(
                "AddNewPatient",
                  new
                  {
                      parms.FullName,
                      parms.Email,
                      parms.Phone,
                      parms.DateOfBirth,
                      parms.Address,
                      parms.Gender
                  },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );

            return result.Message;
        }

        public async Task<IEnumerable<PhysicianResult>> GetAllPhysicians()
        {
            var result = await Connection.QueryAsync<PhysicianResult>(
                "usp_Physician_GetAll",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<string> UpdatePhysician(PhysicianDto physician)
        {
            var specialtyId = physician.SpecialtyID;

            if (!specialtyId.HasValue && !string.IsNullOrWhiteSpace(physician.Specialty))
            {
                var specialties = await Connection.QueryAsync<SpecialtyResult>(
                    "dbo.usp_Specialty_GetAll",
                    commandType: CommandType.StoredProcedure,
                    transaction: _session.Transaction
                );

                specialtyId = specialties
                    .FirstOrDefault(s => string.Equals(s.Specialty, physician.Specialty, StringComparison.OrdinalIgnoreCase))
                    ?.SpecialtyID;
            }

            if (!specialtyId.HasValue)
            {
                return "Specialty is required for physician update.";
            }

            var currentPassword = await Connection.QuerySingleOrDefaultAsync<string>(
                "SELECT Password FROM dbo.Users WHERE UserID = @UserID",
                new { physician.UserId },
                transaction: _session.Transaction
            );

            if (string.IsNullOrWhiteSpace(currentPassword) && string.IsNullOrWhiteSpace(physician.Password))
            {
                return "Unable to resolve physician password for update.";
            }

            var result = await Connection.QuerySingleAsync<string>(
                "usp_Physician_Update",
                new
                {
                    UserID = physician.UserId,
                    FullName = physician.FullName,
                    Email = physician.Email,
                    Password = physician.Password ?? currentPassword,
                    Phone = physician.Phone,
                    Availability = physician.Availability,
                    Bio = physician.Bio,
                    SpecialtyID = specialtyId.Value
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> DeletePhysicianByUserID(long userID)
        {
            var parameters = new { UserId = userID };

            var result = await Connection.ExecuteAsync(
                "usp_Physician_DeleteByUserID",
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result > 0 ? "Physician deleted successfully" : "Failed to delete physician";
        }

        public async Task<IEnumerable<SpecialtyResult>> GetAllSpecialty()
        {
            var result = await Connection.QueryAsync<SpecialtyResult>(
                "dbo.usp_Specialty_GetAll",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<IEnumerable<PersonnelResult>> GetAllPersonnels()
        {
            var result = await Connection.QueryAsync<PersonnelResult>(
                "usp_Personnel_GetAll",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> CreatePersonnel(PersonnelDto personnel)
        {
            var result = await Connection.QuerySingleAsync<string>(
                "usp_Personnel_Add",
                new
                {
                    FullName = personnel.FullName,
                    Email = personnel.Email,
                    Password = personnel.Password,
                    Phone = personnel.Phone,
                    RoleID = personnel.RoleID
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> UpdatePersonnel(PersonnelDto personnel)
        {
            var currentPassword = await Connection.QuerySingleOrDefaultAsync<string>(
                "SELECT Password FROM dbo.Users WHERE UserID = @UserID",
                new { personnel.UserId },
                transaction: _session.Transaction
            );

            if (string.IsNullOrWhiteSpace(currentPassword) && string.IsNullOrWhiteSpace(personnel.Password))
            {
                return "Unable to resolve personnel password for update.";
            }

            var result = await Connection.QuerySingleAsync<string>(
                "usp_Personnel_Update",
                new
                {
                    UserID = personnel.UserId,
                    FullName = personnel.FullName,
                    Email = personnel.Email,
                    Password = personnel.Password ?? currentPassword,
                    Phone = personnel.Phone
                },
                 commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<IEnumerable<PersonnelDto>> GetPersonnelByID(long personnelID)
        {
            var result = await Connection.QueryAsync<PersonnelDto>(
                "usp_Personnel_GetByID",
                new { PersonnelID = personnelID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<string> DeletePersonnelByUserID(long userID)
        {
            var result = await Connection.QueryAsync<string>(
                "dbo.usp_Personnel_DeleteByUserID",
                new { UserID = userID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result.FirstOrDefault() ?? "No message returned from stored procedure.";
        }
    }
}
