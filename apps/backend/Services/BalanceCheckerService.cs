using System.Text;
using DigitalLedger.Api.Models.DTOs.BalanceChecker;
using DigitalLedger.Api.Services.Interfaces;

namespace DigitalLedger.Api.Services;

public class BalanceCheckerService : IBalanceCheckerService
{
    private const int EXPECTED_COLUMN_COUNT = 4;
    private const string TEMPLATE_HEADER = "Account,Description,Debit,Credit";

    public async Task<BalanceCheckResultDto> CheckBalanceAsync(Stream csvStream)
    {
        var entries = new List<CsvEntryDto>();
        var errors = new List<string>();

        using var reader = new StreamReader(csvStream);

        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            errors.Add("CSV file is empty or missing a header row.");
            return BuildResult(entries, errors);
        }

        var headers = ParseCsvLine(headerLine);
        if (!IsValidHeader(headers))
        {
            errors.Add($"Invalid header. Expected: \"{TEMPLATE_HEADER}\". Received: \"{headerLine.Trim()}\".");
            return BuildResult(entries, errors);
        }

        var lineNumber = 1;
        while (await reader.ReadLineAsync() is { } line)
        {
            lineNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            var columns = ParseCsvLine(line);
            if (columns.Length < EXPECTED_COLUMN_COUNT)
            {
                errors.Add($"Row {lineNumber}: Expected {EXPECTED_COLUMN_COUNT} columns but found {columns.Length}.");
                continue;
            }

            var account = columns[0].Trim();
            var description = columns[1].Trim();
            var debitRaw = columns[2].Trim();
            var creditRaw = columns[3].Trim();

            var isDebitValid = TryParseAmount(debitRaw, out var debit);
            var isCreditValid = TryParseAmount(creditRaw, out var credit);

            if (!isDebitValid)
            {
                errors.Add($"Row {lineNumber}: Invalid debit value \"{debitRaw}\".");
                continue;
            }

            if (!isCreditValid)
            {
                errors.Add($"Row {lineNumber}: Invalid credit value \"{creditRaw}\".");
                continue;
            }

            entries.Add(new CsvEntryDto
            {
                Account = account,
                Description = description,
                Debit = debit,
                Credit = credit
            });
        }

        return BuildResult(entries, errors);
    }

    public byte[] GenerateTemplate()
    {
        var sb = new StringBuilder();
        sb.AppendLine(TEMPLATE_HEADER);
        sb.AppendLine("Cash,Received payment from client,1000.00,0.00");
        sb.AppendLine("Revenue,Service income,0.00,1000.00");

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static bool TryParseAmount(string raw, out decimal amount)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            amount = 0m;
            return true;
        }

        return decimal.TryParse(raw, out amount);
    }

    private static BalanceCheckResultDto BuildResult(List<CsvEntryDto> entries, List<string> errors)
    {
        var totalDebits = entries.Sum(e => e.Debit);
        var totalCredits = entries.Sum(e => e.Credit);

        return new BalanceCheckResultDto
        {
            IsBalanced = totalDebits == totalCredits,
            TotalDebits = totalDebits,
            TotalCredits = totalCredits,
            Difference = Math.Abs(totalDebits - totalCredits),
            EntryCount = entries.Count,
            Entries = entries,
            Errors = errors
        };
    }

    private static bool IsValidHeader(string[] headers)
    {
        if (headers.Length < EXPECTED_COLUMN_COUNT)
            return false;

        return string.Equals(headers[0].Trim(), "Account", StringComparison.OrdinalIgnoreCase)
            && string.Equals(headers[1].Trim(), "Description", StringComparison.OrdinalIgnoreCase)
            && string.Equals(headers[2].Trim(), "Debit", StringComparison.OrdinalIgnoreCase)
            && string.Equals(headers[3].Trim(), "Credit", StringComparison.OrdinalIgnoreCase);
    }

    private static string[] ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var currentField = new StringBuilder();
        var isInsideQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var character = line[i];

            if (character == '"')
            {
                if (isInsideQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    currentField.Append('"');
                    i++;
                }
                else
                {
                    isInsideQuotes = !isInsideQuotes;
                }
            }
            else if (character == ',' && !isInsideQuotes)
            {
                fields.Add(currentField.ToString());
                currentField.Clear();
            }
            else
            {
                currentField.Append(character);
            }
        }

        fields.Add(currentField.ToString());
        return fields.ToArray();
    }
}
