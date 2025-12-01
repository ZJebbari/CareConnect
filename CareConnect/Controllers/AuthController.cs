using CareConnect.Common;
using CareConnect.Models.Dtos;
using CareConnect.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IUserService _userService, IConfiguration _config) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _userService.ValidateUserAsync(login.Email, login.Password);

            if (user == null)
                return Unauthorized("Invalid email or password");

            var token = JwtHelper.GenerateToken(user, _config);

            return Ok(new
            {
                token,
                role = user.RoleName,
                fullName = user.FullName
            });
        }
    }
}
