using CareConnect.Models.Database.results;   // UserLoginResult returned from stored procedure
using Microsoft.IdentityModel.Tokens;        // Provides JWT signing and validation security
using System.IdentityModel.Tokens.Jwt;       // Handles creation and serialization of JWT tokens
using System.Security.Claims;                // Claims represent user identity info embedded in token
using System.Text;                           // Encoding for the signing key

namespace CareConnect.Common
{
    // Static helper class → no need to create an object to generate a token
    public static class JwtHelper
    {
        // Generates a JWT token containing user identity + authorization roles
        // Stored in browser → included in all protected API calls via Authorization header
        public static string GenerateToken(UserLoginResult user, IConfiguration config)
        {
            // ================================================================
            // 🔑 Create a security key using the secret from appsettings.json
            // This key is used for both signing and validating JWT tokens
            // If key changes → all existing tokens become invalid ✔ secure
            // ================================================================
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!)
            );

            // 🔐 Signing credentials: key + which hash algorithm to use for token signature
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // ================================================================
            // 🧾 Claims → embedded identity info inside the token payload:
            //  - UserId          → uniquely identifies user in the database
            //  - Email           → secondary identifier for UI & logs
            //  - RoleName        → enables role-based access [Authorize(Roles="Admin")]
            // Backend checks this claim to allow/deny admin actions
            // ================================================================
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.RoleName)
            };

            // ================================================================
            // 🎫 Build actual JWT token with:
            //  - Issuer/Audience → protects against tokens from other sources
            //  - Claims → user identity + permissions
            //  - Expiration → automatically logs out user after 1 hour
            //  - Signing credentials → prevents token tampering
            // ================================================================
            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            // Convert token object → string format to send back to Angular
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
