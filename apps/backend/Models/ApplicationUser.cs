using Microsoft.AspNetCore.Identity;

namespace DigitalLedger.Api.Models;

public class ApplicationUser : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public bool IsActive { get; set; } = true;
}
