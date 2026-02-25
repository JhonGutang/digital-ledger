using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Transaction;
using DigitalLedger.Api.Models.Enums;
using DigitalLedger.Api.Repositories.Interfaces;
using DigitalLedger.Api.Services;
using Moq;

namespace DigitalLedger.Tests.Services;

public class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _mockTransactionRepository;
    private readonly Mock<IAccountRepository> _mockAccountRepository;
    private readonly TransactionService _transactionService;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _validAccountId1 = Guid.NewGuid();
    private readonly Guid _validAccountId2 = Guid.NewGuid();

    public TransactionServiceTests()
    {
        _mockTransactionRepository = new Mock<ITransactionRepository>();
        _mockAccountRepository = new Mock<IAccountRepository>();
        _transactionService = new TransactionService(_mockTransactionRepository.Object, _mockAccountRepository.Object);

        var validAccount1 = new Account { Id = _validAccountId1, Code = "100", Name = "Cash", IsActive = true, Category = AccountCategory.ASSET, NormalBalance = NormalBalance.DEBIT };
        var validAccount2 = new Account { Id = _validAccountId2, Code = "400", Name = "Revenue", IsActive = true, Category = AccountCategory.REVENUE, NormalBalance = NormalBalance.CREDIT };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(_validAccountId1)).ReturnsAsync(validAccount1);
        _mockAccountRepository.Setup(r => r.GetByIdAsync(_validAccountId2)).ReturnsAsync(validAccount2);
    }

    [Fact]
    public async Task CreateAsync_BalancedEntries_ReturnsTransaction()
    {
        // Arrange
        var dto = new CreateTransactionDto
        {
            Description = "Test balanced",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _validAccountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        var createdTx = new Transaction { Id = Guid.NewGuid(), Description = dto.Description, Date = dto.Date, Status = dto.Status };
        _mockTransactionRepository.Setup(r => r.CreateAsync(It.IsAny<Transaction>())).ReturnsAsync(createdTx);
        _mockTransactionRepository.Setup(r => r.GetByIdAsync(createdTx.Id)).ReturnsAsync(createdTx);

        // Act
        var result = await _transactionService.CreateAsync(dto, _userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Description, result.Description);
    }

    [Fact]
    public async Task CreateAsync_UnbalancedPendingApproval_ThrowsBusinessRuleException()
    {
        // Arrange
        var dto = new CreateTransactionDto
        {
            Description = "Test unbalanced",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.PENDING_APPROVAL,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _validAccountId2, Amount = 50, EntryType = EntryType.CREDIT }
            }
        };

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(() => _transactionService.CreateAsync(dto, _userId));
    }

    [Fact]
    public async Task CreateAsync_UnbalancedDraft_Succeeds()
    {
        // Arrange
        var dto = new CreateTransactionDto
        {
            Description = "Test unbalanced draft",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _validAccountId2, Amount = 50, EntryType = EntryType.CREDIT }
            }
        };

        var createdTx = new Transaction { Id = Guid.NewGuid(), Description = dto.Description, Date = dto.Date, Status = dto.Status };
        _mockTransactionRepository.Setup(r => r.CreateAsync(It.IsAny<Transaction>())).ReturnsAsync(createdTx);
        _mockTransactionRepository.Setup(r => r.GetByIdAsync(createdTx.Id)).ReturnsAsync(createdTx);

        // Act
        var result = await _transactionService.CreateAsync(dto, _userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Description, result.Description);
    }

    [Fact]
    public async Task CreateAsync_LessThanTwoEntries_ThrowsBusinessRuleException()
    {
         var dto = new CreateTransactionDto
        {
            Description = "1 entry only",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT }
            }
        };

        await Assert.ThrowsAsync<BusinessRuleException>(() => _transactionService.CreateAsync(dto, _userId));
    }

    [Fact]
    public async Task CreateAsync_InvalidAccountId_ThrowsNotFoundException()
    {
        var invalidAccountId = Guid.NewGuid();
        var dto = new CreateTransactionDto
        {
            Description = "Invalid account",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = invalidAccountId, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(invalidAccountId)).ReturnsAsync((Account?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _transactionService.CreateAsync(dto, _userId));
    }

    [Fact]
    public async Task CreateAsync_InvalidStatus_ThrowsBusinessRuleException()
    {
        var dto = new CreateTransactionDto
        {
            Description = "Posted status",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.POSTED,
            Entries = new List<CreateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { AccountId = _validAccountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        await Assert.ThrowsAsync<BusinessRuleException>(() => _transactionService.CreateAsync(dto, _userId));
    }

    [Fact]
    public async Task UpdateAsync_DraftTransaction_UpdatesSuccessfully()
    {
        var txId = Guid.NewGuid();
        var entryId1 = Guid.NewGuid();
        var entryId2 = Guid.NewGuid();
        var existingTx = new Transaction
        {
            Id = txId,
            Description = "Old",
            Status = TransactionStatus.DRAFT,
            Date = DateTime.UtcNow,
            Entries = new List<TransactionEntry>
            {
                new() { Id = entryId1, TransactionId = txId, AccountId = _validAccountId1, Amount = 100, EntryType = EntryType.DEBIT },
                new() { Id = entryId2, TransactionId = txId, AccountId = _validAccountId2, Amount = 100, EntryType = EntryType.CREDIT }
            }
        };

        _mockTransactionRepository.Setup(r => r.GetByIdAsync(txId)).ReturnsAsync(existingTx);
        _mockTransactionRepository.Setup(r => r.UpdateAsync(It.IsAny<Transaction>(), It.IsAny<List<TransactionEntry>>())).ReturnsAsync(existingTx);

        var updateDto = new UpdateTransactionDto
        {
            Description = "New",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<UpdateTransactionEntryDto>
            {
                new() { Id = entryId1, AccountId = _validAccountId1, Amount = 200, EntryType = EntryType.DEBIT },
                new() { Id = entryId2, AccountId = _validAccountId2, Amount = 200, EntryType = EntryType.CREDIT }
            }
        };

        var result = await _transactionService.UpdateAsync(txId, updateDto, _userId);

        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateAsync_NonDraftTransaction_ThrowsBusinessRuleException()
    {
        var txId = Guid.NewGuid();
        var existingTx = new Transaction
        {
            Id = txId,
            Description = "Pending",
            Status = TransactionStatus.PENDING_APPROVAL,
            Date = DateTime.UtcNow,
            Entries = new List<TransactionEntry>()
        };

        _mockTransactionRepository.Setup(r => r.GetByIdAsync(txId)).ReturnsAsync(existingTx);

        var updateDto = new UpdateTransactionDto
        {
            Description = "New",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.DRAFT,
            Entries = new List<UpdateTransactionEntryDto>
            {
                new() { AccountId = _validAccountId1, Amount = 200, EntryType = EntryType.DEBIT },
                new() { AccountId = _validAccountId2, Amount = 200, EntryType = EntryType.CREDIT }
            }
        };

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _transactionService.UpdateAsync(txId, updateDto, _userId));
        Assert.Contains("Only DRAFT transactions can be edited", ex.Message);
    }

    [Fact]
    public async Task DeleteAsync_DraftTransaction_DeletesSuccessfully()
    {
        var txId = Guid.NewGuid();
        var existingTx = new Transaction { Id = txId, Status = TransactionStatus.DRAFT, Description = "Draft transaction" };

        _mockTransactionRepository.Setup(r => r.GetByIdAsync(txId)).ReturnsAsync(existingTx);

        await _transactionService.DeleteAsync(txId);

        _mockTransactionRepository.Verify(r => r.DeleteAsync(existingTx), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonDraftTransaction_ThrowsBusinessRuleException()
    {
        var txId = Guid.NewGuid();
        var existingTx = new Transaction { Id = txId, Status = TransactionStatus.PENDING_APPROVAL, Description = "Pending transaction" };

        _mockTransactionRepository.Setup(r => r.GetByIdAsync(txId)).ReturnsAsync(existingTx);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _transactionService.DeleteAsync(txId));
        Assert.Contains("Only DRAFT transactions can be deleted", ex.Message);
    }

    [Fact]
    public async Task DeleteAsync_NonExistentTransaction_ThrowsNotFoundException()
    {
        var txId = Guid.NewGuid();

        _mockTransactionRepository.Setup(r => r.GetByIdAsync(txId)).ReturnsAsync((Transaction?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _transactionService.DeleteAsync(txId));
    }
}
