using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models.DTOs.Account;

public class CreateAccountDto
{
    [Required]
    public required string Code { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public AccountCategory Category { get; set; }

    public string? Description { get; set; }
}

public class UpdateAccountDto
{
    [Required]
    public required string Name { get; set; }

    public string? Description { get; set; }
}

public class AccountResponseDto
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string NormalBalance { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
