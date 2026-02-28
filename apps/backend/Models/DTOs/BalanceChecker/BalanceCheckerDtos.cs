namespace DigitalLedger.Api.Models.DTOs.BalanceChecker;

public class CsvEntryDto
{
    public required string Account { get; set; }
    public required string Description { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class BalanceCheckResultDto
{
    public bool IsBalanced { get; set; }
    public decimal TotalDebits { get; set; }
    public decimal TotalCredits { get; set; }
    public decimal Difference { get; set; }
    public int EntryCount { get; set; }
    public List<CsvEntryDto> Entries { get; set; } = [];
    public List<string> Errors { get; set; } = [];
}
