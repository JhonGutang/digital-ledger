using DigitalLedger.Api.Data;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Transaction;
using DigitalLedger.Api.Models.Enums;
using DigitalLedger.Api.Repositories;
using DigitalLedger.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace DigitalLedger.Tests.Services;

public class TransactionServiceIntegrationTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly ApplicationDbContext _context;
    private readonly TransactionRepository _transactionRepository;
    private readonly AccountRepository _accountRepository;
    private readonly TransactionService _transactionService;
    private readonly Guid _userId = Guid.NewGuid();
    private Guid _accountId1;
    private Guid _accountId2;

    public TransactionServiceIntegrationTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        _transactionRepository = new TransactionRepository(_context);
        _accountRepository = new AccountRepository(_context);
        _transactionService = new TransactionService(_transactionRepository, _accountRepository);

        SeedAccounts();
    }

    private void SeedAccounts()
    {
        _accountId1 = Guid.NewGuid();
        _accountId2 = Guid.NewGuid();

        _context.Accounts.AddRange(
            new Account { Id = _accountId1, Code = "100", Name = "Cash", IsActive = true, Category = AccountCategory.ASSET, NormalBalance = NormalBalance.DEBIT },
            new Account { Id = _accountId2, Code = "400", Name = "Revenue", IsActive = true, Category = AccountCategory.REVENUE, NormalBalance = NormalBalance.CREDIT }
        );

        // Seed a user for CreatedBy FK
        _context.Users.Add(new ApplicationUser
        {
            Id = _userId.ToString(),
            UserName = "testuser@test.com",
            Email = "testuser@test.com",
            NormalizedEmail = "TESTUSER@TEST.COM",
            NormalizedUserName = "TESTUSER@TEST.COM",
            FirstName = "Test",
            LastName = "User"
        });

        _context.SaveChanges();
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_UpdatesDescriptionSuccessfully()
    {
        var createDto = new CreateTransactionDto
        {
            Description = "Original description",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var created = await _transactionService.CreateAsync(createDto, _userId);

        var updateDto = new UpdateTransactionDto
        {
            Description = "Updated description",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<UpdateTransactionEntryDto>
            {
                new() { Id = created.Entries[0].Id, AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { Id = created.Entries[1].Id, AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(created.Id, updateDto, _userId);

        Assert.NotNull(result);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal(2, result.Entries.Count);
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_UpdatesEntryAmountsSuccessfully()
    {
        var createDto = new CreateTransactionDto
        {
            Description = "Amount update test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var created = await _transactionService.CreateAsync(createDto, _userId);

        var updateDto = new UpdateTransactionDto
        {
            Description = "Amount update test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<UpdateTransactionEntryDto>
            {
                new() { Id = created.Entries[0].Id, AccountId = _accountId1, Amount = 500, EntryType = EntryType.DEBIT },
                new() { Id = created.Entries[1].Id, AccountId = _accountId2, Amount = 500, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(created.Id, updateDto, _userId);

        Assert.NotNull(result);
        Assert.Equal(2, result.Entries.Count);
        Assert.Equal(500, result.Entries.First(e => e.EntryType == "DEBIT").Amount);
        Assert.Equal(500, result.Entries.First(e => e.EntryType == "CREDIT").Amount);

        var dbEntries = await _context.TransactionEntries
            .Where(e => e.TransactionId == created.Id)
            .ToListAsync();
        Assert.Equal(2, dbEntries.Count);
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_AddsNewEntrySuccessfully()
    {
        var createDto = new CreateTransactionDto
        {
            Description = "Add entry test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var created = await _transactionService.CreateAsync(createDto, _userId);

        var updateDto = new UpdateTransactionDto
        {
            Description = "Add entry test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<UpdateTransactionEntryDto>
            {
                new() { Id = created.Entries[0].Id, AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { Id = created.Entries[1].Id, AccountId = _accountId2, Amount = 50, EntryType = EntryType.CREDIT },
                new() { AccountId = _accountId2, Amount = 50, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(created.Id, updateDto, _userId);

        Assert.NotNull(result);
        Assert.Equal(3, result.Entries.Count);

        var dbEntries = await _context.TransactionEntries
            .Where(e => e.TransactionId == created.Id)
            .ToListAsync();
        Assert.Equal(3, dbEntries.Count);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
