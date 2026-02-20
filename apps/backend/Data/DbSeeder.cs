using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace DigitalLedger.Api.Data;

public static class DbSeeder
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Create Roles
        string[] roleNames = { Roles.ADMIN, Roles.ACCOUNTANT, Roles.AUDITOR };

        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Create Default Admin User
        var adminEmail = "admin@digital-ledger.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var newAdmin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "System",
                LastName = "Admin",
                IsActive = true,
                EmailConfirmed = true
            };

            var createAdminResult = await userManager.CreateAsync(newAdmin, "Admin123!");
            if (createAdminResult.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, Roles.ADMIN);
            }
        }
    }
}
