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
        // Arrange — Create a draft transaction first
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

        // Act — Update the description
        var updateDto = new UpdateTransactionDto
        {
            Description = "Updated description",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(created.Id, updateDto, _userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal(2, result.Entries.Count);
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_ReplacesEntriesSuccessfully()
    {
        // Arrange — Create a draft with 2 entries
        var createDto = new CreateTransactionDto
        {
            Description = "Entry replacement test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var created = await _transactionService.CreateAsync(createDto, _userId);

        // Act — Update with different amounts
        var updateDto = new UpdateTransactionDto
        {
            Description = "Entry replacement test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 500, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 500, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(created.Id, updateDto, _userId);

        // Assert — Verify entries were replaced, not duplicated
        Assert.NotNull(result);
        Assert.Equal(2, result.Entries.Count);
        Assert.Equal(500, result.Entries.First(e => e.EntryType == "DEBIT").Amount);
        Assert.Equal(500, result.Entries.First(e => e.EntryType == "CREDIT").Amount);

        // Verify no orphaned entries in DB
        var dbEntries = await _context.TransactionEntries
            .Where(e => e.TransactionId == created.Id)
            .ToListAsync();
        Assert.Equal(2, dbEntries.Count);
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_ConsecutiveUpdatesSucceed()
    {
        // Arrange — Create a draft
        var createDto = new CreateTransactionDto
        {
            Description = "Consecutive update test",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var created = await _transactionService.CreateAsync(createDto, _userId);

        // Act — Update twice in a row (simulates autosave)
        var updateDto1 = new UpdateTransactionDto
        {
            Description = "First update",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 200, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 200, EntryType = EntryType.CREDIT }
            }
        };

        var result1 = await _transactionService.UpdateAsync(created.Id, updateDto1, _userId);
        Assert.Equal("First update", result1.Description);

        var updateDto2 = new UpdateTransactionDto
        {
            Description = "Second update",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _accountId1, Amount = 300, EntryType = EntryType.DEBIT },
                new() { AccountId = _accountId2, Amount = 300, EntryType = EntryType.CREDIT }
            }
        };

        var result2 = await _transactionService.UpdateAsync(created.Id, updateDto2, _userId);

        // Assert
        Assert.Equal("Second update", result2.Description);
        Assert.Equal(300, result2.Entries.First(e => e.EntryType == "DEBIT").Amount);

        // Verify only 2 entries in DB (no orphans from multiple updates)
        var dbEntries = await _context.TransactionEntries
            .Where(e => e.TransactionId == created.Id)
            .ToListAsync();
        Assert.Equal(2, dbEntries.Count);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
