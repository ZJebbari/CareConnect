using System.Security.Claims;

namespace CareConnect.Common
{
    public static class CurrentUserHelper
    {
        public static int? GetUserId(ClaimsPrincipal? user)
        {
            var userIdValue = user?.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(userIdValue, out var userId) ? userId : null;
        }
    }
}