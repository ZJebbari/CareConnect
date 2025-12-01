using CareConnect.Common;           // Contains JwtHelper for generating JWT tokens
using CareConnect.Models.Dtos;      // LoginDto model for request payload
using CareConnect.Services;         // IUserService for validating user credentials
using Microsoft.AspNetCore.Mvc;     // ASP.NET Core MVC utilities for controllers

namespace CareConnect.Controllers
{
    // Marks this as an API controller
    // Enables automatic model validation and cleaner responses
    [ApiController]

    // Defines the base route for this controller → /api/Auth
    [Route("api/[controller]")]
    public class AuthController(IUserService _userService, IConfiguration _config) : ControllerBase
    {
        // POST /api/Auth/login
        // Accepts login credentials and returns a signed JWT token if valid
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            // Validate email/password against database via service layer
            // This calls repo → stored proc → SQL Users & Roles tables
            var user = await _userService.ValidateUserAsync(login.Email, login.Password);

            // If credentials incorrect:
            // Return HTTP 401 so frontend knows login failed
            if (user == null)
                return Unauthorized("Invalid email or password");

            // Generate token that includes:
            // - UserID (ClaimTypes.NameIdentifier)
            // - Email (ClaimTypes.Name)
            // - Role (ClaimTypes.Role)
            // Token is signed using the Key in appsettings.json
            var token = JwtHelper.GenerateToken(user, _config);

            // Return the following data to frontend:
            // - token → stored in localStorage → automatically attached to API calls
            // - role → used in Angular to control route access & UI (Admin vs Patient)
            // - fullName → shown in navbar/header
            return Ok(new
            {
                token,
                role = user.RoleName,
                fullName = user.FullName
            });
        }
    }
}
