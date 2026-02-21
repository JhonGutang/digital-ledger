using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models;

public class TransactionEntry
{
    public Guid Id { get; set; }

    [Required]
    public Guid TransactionId { get; set; }
    
    public Transaction? Transaction { get; set; }

    [Required]
    public Guid AccountId { get; set; }
    
    public Account? Account { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public EntryType EntryType { get; set; }

    public string? Description { get; set; }
}
