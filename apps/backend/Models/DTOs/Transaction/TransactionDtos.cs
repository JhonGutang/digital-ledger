using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models.DTOs.Transaction;

public class CreateTransactionEntryDto
{
    [Required]
    public Guid AccountId { get; set; }

    [Required]
    [Range(0.01, (double)decimal.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required]
    public EntryType EntryType { get; set; }

    public string? Description { get; set; }
}

public class CreateTransactionDto
{
    public string? ReferenceNumber { get; set; }

    [Required]
    public required string Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TransactionStatus Status { get; set; }

    [Required]
    [MinLength(2, ErrorMessage = "A transaction must have at least two entries.")]
    public required List<CreateTransactionEntryDto> Entries { get; set; }
}

public class UpdateTransactionDto
{
    public string? ReferenceNumber { get; set; }

    [Required]
    public required string Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TransactionStatus Status { get; set; }

    [Required]
    [MinLength(2, ErrorMessage = "A transaction must have at least two entries.")]
    public required List<CreateTransactionEntryDto> Entries { get; set; }
}

public class TransactionEntryResponseDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public required string AccountCode { get; set; }
    public required string AccountName { get; set; }
    public decimal Amount { get; set; }
    public required string EntryType { get; set; }
    public string? Description { get; set; }
}

public class TransactionResponseDto
{
    public Guid Id { get; set; }
    public string? ReferenceNumber { get; set; }
    public required string Description { get; set; }
    public DateTime Date { get; set; }
    public required string Status { get; set; }
    public Guid CreatedBy { get; set; }
    public string? CreatorName { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApproverName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TransactionEntryResponseDto> Entries { get; set; } = new();
}
