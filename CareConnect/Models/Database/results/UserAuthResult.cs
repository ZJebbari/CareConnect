namespace CareConnect.Models.Database.results
{
    /// <summary>
    /// Internal model for user authentication - includes password hash.
    /// NOT returned to frontend; used only for login verification.
    /// </summary>
    public class UserAuthResult
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
    }
}
