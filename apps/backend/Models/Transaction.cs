using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models;

public class Transaction
{
    public Guid Id { get; set; }

    [MaxLength(50)]
    public string? ReferenceNumber { get; set; }

    [Required]
    public required string Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TransactionStatus Status { get; set; }

    public Guid CreatedBy { get; set; }
    
    public ApplicationUser? Creator { get; set; }

    public Guid? ApprovedBy { get; set; }
    
    public ApplicationUser? Approver { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<TransactionEntry> Entries { get; set; } = new();
}
