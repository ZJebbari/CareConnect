using BCrypt.Net;

namespace CareConnect.Common
{
    /// <summary>
    /// Utility for secure password hashing and verification using BCrypt.
    /// </summary>
    public static class PasswordHasher
    {
        public static bool IsBcryptHash(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && (value.StartsWith("$2a$") || value.StartsWith("$2b$") || value.StartsWith("$2y$"));
        }

        /// <summary>
        /// Hashes a plain text password using BCrypt with cost factor 11.
        /// </summary>
        /// <param name="plainPassword">The plain text password to hash</param>
        /// <returns>The BCrypt hash (approximately 60 characters)</returns>
        public static string HashPassword(string plainPassword)
        {
            // Cost factor of 11 provides strong security with acceptable performance
            // Higher = slower to compute (better security, but slower login)
            return BCrypt.Net.BCrypt.HashPassword(plainPassword, 11);
        }

        /// <summary>
        /// Verifies a plain text password against a BCrypt hash.
        /// </summary>
        /// <param name="plainPassword">The plain text password to verify</param>
        /// <param name="hash">The BCrypt hash to verify against</param>
        /// <returns>True if password matches the hash, false otherwise</returns>
        public static bool VerifyPassword(string plainPassword, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(plainPassword, hash);
            }
            catch
            {
                // If verification fails (e.g., invalid hash format), return false
                return false;
            }
        }

        public static bool VerifyLegacyPlainText(string plainPassword, string storedValue)
        {
            return !string.IsNullOrWhiteSpace(storedValue)
                && !IsBcryptHash(storedValue)
                && string.Equals(plainPassword, storedValue, StringComparison.Ordinal);
        }
    }
}
