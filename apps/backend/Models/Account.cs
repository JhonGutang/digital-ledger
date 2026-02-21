using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models;

public class Account
{
    public Guid Id { get; set; }

    [Required, MaxLength(20)]
    public required string Code { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [Required]
    public AccountCategory Category { get; set; }

    [Required]
    public NormalBalance NormalBalance { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
