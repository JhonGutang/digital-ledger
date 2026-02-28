using System.Text;
using DigitalLedger.Api.Services;

namespace DigitalLedger.Tests.Services;

public class BalanceCheckerServiceTests
{
    private readonly BalanceCheckerService _balanceCheckerService;

    public BalanceCheckerServiceTests()
    {
        _balanceCheckerService = new BalanceCheckerService();
    }

    [Fact]
    public async Task CheckBalanceAsync_BalancedCsv_ReturnsIsBalancedTrue()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment received,1000.00,0.00\nRevenue,Service income,0.00,1000.00";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(1000.00m, balanceCheckResult.TotalDebits);
        Assert.Equal(1000.00m, balanceCheckResult.TotalCredits);
        Assert.Equal(0m, balanceCheckResult.Difference);
        Assert.Equal(2, balanceCheckResult.EntryCount);
        Assert.Empty(balanceCheckResult.Errors);
    }

    [Fact]
    public async Task CheckBalanceAsync_UnbalancedCsv_ReturnsIsBalancedFalse()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment received,1500.00,0.00\nRevenue,Service income,0.00,1000.00";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.False(balanceCheckResult.IsBalanced);
        Assert.Equal(1500.00m, balanceCheckResult.TotalDebits);
        Assert.Equal(1000.00m, balanceCheckResult.TotalCredits);
        Assert.Equal(500.00m, balanceCheckResult.Difference);
    }

    [Fact]
    public async Task CheckBalanceAsync_EmptyCsvHeadersOnly_ReturnsBalancedWithZeros()
    {
        var csv = "Account,Description,Debit,Credit\n";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(0m, balanceCheckResult.TotalDebits);
        Assert.Equal(0m, balanceCheckResult.TotalCredits);
        Assert.Equal(0, balanceCheckResult.EntryCount);
        Assert.Empty(balanceCheckResult.Errors);
    }

    [Fact]
    public async Task CheckBalanceAsync_EmptyAmounts_DefaultsToZero()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment received,1000.00,\nRevenue,Service income,,1000.00";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(1000.00m, balanceCheckResult.TotalDebits);
        Assert.Equal(1000.00m, balanceCheckResult.TotalCredits);
        Assert.Equal(2, balanceCheckResult.EntryCount);
        Assert.Equal(0m, balanceCheckResult.Entries[0].Credit);
        Assert.Equal(0m, balanceCheckResult.Entries[1].Debit);
    }

    [Fact]
    public async Task CheckBalanceAsync_InvalidAmountValues_ReportsRowErrors()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment received,abc,0.00\nRevenue,Service income,0.00,xyz";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(0, balanceCheckResult.EntryCount);
        Assert.Equal(2, balanceCheckResult.Errors.Count);
        Assert.Contains("Row 2", balanceCheckResult.Errors[0]);
        Assert.Contains("Row 3", balanceCheckResult.Errors[1]);
    }

    [Fact]
    public async Task CheckBalanceAsync_MissingColumns_ReportsRowError()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment received";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.Equal(0, balanceCheckResult.EntryCount);
        Assert.Single(balanceCheckResult.Errors);
        Assert.Contains("Row 2", balanceCheckResult.Errors[0]);
    }

    [Fact]
    public async Task CheckBalanceAsync_InvalidHeader_ReportsHeaderError()
    {
        var csv = "Name,Desc,Amount\nCash,Payment,1000";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.Single(balanceCheckResult.Errors);
        Assert.Contains("Invalid header", balanceCheckResult.Errors[0]);
        Assert.Equal(0, balanceCheckResult.EntryCount);
    }

    [Fact]
    public async Task CheckBalanceAsync_EmptyFile_ReportsError()
    {
        var csv = "";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.Single(balanceCheckResult.Errors);
        Assert.Contains("empty", balanceCheckResult.Errors[0]);
    }

    [Fact]
    public async Task CheckBalanceAsync_QuotedFields_ParsesCorrectly()
    {
        var csv = "Account,Description,Debit,Credit\n\"Cash, Bank\",\"Received payment, from client\",1000.00,0.00\nRevenue,Service income,0.00,1000.00";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(2, balanceCheckResult.EntryCount);
        Assert.Equal("Cash, Bank", balanceCheckResult.Entries[0].Account);
        Assert.Equal("Received payment, from client", balanceCheckResult.Entries[0].Description);
    }

    [Fact]
    public void GenerateTemplate_ReturnsValidCsvBytes()
    {
        var templateBytes = _balanceCheckerService.GenerateTemplate();
        var templateContent = Encoding.UTF8.GetString(templateBytes);

        Assert.Contains("Account,Description,Debit,Credit", templateContent);
        Assert.Contains("Cash", templateContent);
        Assert.Contains("Revenue", templateContent);
    }

    [Fact]
    public async Task CheckBalanceAsync_MultipleEntries_CalculatesTotalsCorrectly()
    {
        var csv = "Account,Description,Debit,Credit\nCash,Payment A,500.00,0.00\nInventory,Purchase,300.00,0.00\nRevenue,Income A,0.00,500.00\nAccounts Payable,Owed,0.00,300.00";
        using var csvStream = new MemoryStream(Encoding.UTF8.GetBytes(csv));

        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);

        Assert.True(balanceCheckResult.IsBalanced);
        Assert.Equal(800.00m, balanceCheckResult.TotalDebits);
        Assert.Equal(800.00m, balanceCheckResult.TotalCredits);
        Assert.Equal(4, balanceCheckResult.EntryCount);
    }
}
