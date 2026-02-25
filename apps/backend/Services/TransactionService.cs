using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Transaction;
using DigitalLedger.Api.Models.Enums;
using DigitalLedger.Api.Repositories.Interfaces;
using DigitalLedger.Api.Services.Interfaces;

namespace DigitalLedger.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IAccountRepository _accountRepository;

    public TransactionService(ITransactionRepository transactionRepository, IAccountRepository accountRepository)
    {
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    public async Task<List<TransactionResponseDto>> GetAllAsync()
    {
        var transactions = await _transactionRepository.GetAllAsync();
        return transactions.Select(MapToResponse).ToList();
    }

    public async Task<TransactionResponseDto> GetByIdAsync(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id) 
            ?? throw new NotFoundException("Transaction", id);
            
        return MapToResponse(transaction);
    }

    public async Task<TransactionResponseDto> CreateAsync(CreateTransactionDto dto, Guid userId)
    {
        ValidateTransactionState(dto.Status, dto.Entries);
        await ValidateAccountsAsync(dto.Entries);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = dto.ReferenceNumber,
            Description = dto.Description,
            Date = dto.Date,
            Status = dto.Status,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Entries = dto.Entries.Select(e => new TransactionEntry
            {
                Id = Guid.NewGuid(),
                AccountId = e.AccountId,
                Amount = e.Amount,
                EntryType = e.EntryType,
                Description = e.Description
            }).ToList()
        };

        var createdTransaction = await _transactionRepository.CreateAsync(transaction);
        
        // Reload to get Account names for the response DTO
        var reloadedTransaction = await _transactionRepository.GetByIdAsync(createdTransaction.Id);
        return MapToResponse(reloadedTransaction!);
    }

    public async Task<TransactionResponseDto> UpdateAsync(Guid id, UpdateTransactionDto dto, Guid userId)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id) 
            ?? throw new NotFoundException("Transaction", id);

        if (transaction.Status != TransactionStatus.DRAFT)
        {
            throw new BusinessRuleException(
                $"Cannot modify a transaction in {transaction.Status} status. Only DRAFT transactions can be edited.");
        }

        ValidateTransactionState(dto.Status, dto.Entries);
        await ValidateAccountsAsync(dto.Entries);

        transaction.ReferenceNumber = dto.ReferenceNumber;
        transaction.Description = dto.Description;
        transaction.Date = dto.Date;
        transaction.Status = dto.Status;
        transaction.UpdatedAt = DateTime.UtcNow;

        var existingEntriesById = transaction.Entries.ToDictionary(e => e.Id);
        var incomingIds = new HashSet<Guid>(dto.Entries.Where(e => e.Id.HasValue).Select(e => e.Id!.Value));

        var entriesToRemove = existingEntriesById.Keys
            .Except(incomingIds)
            .Select(removedId => existingEntriesById[removedId])
            .ToList();

        foreach (var entry in entriesToRemove)
        {
            transaction.Entries.Remove(entry);
        }

        foreach (var entryDto in dto.Entries)
        {
            if (entryDto.Id.HasValue && existingEntriesById.TryGetValue(entryDto.Id.Value, out var existingEntry))
            {
                existingEntry.AccountId = entryDto.AccountId;
                existingEntry.Amount = entryDto.Amount;
                existingEntry.EntryType = entryDto.EntryType;
                existingEntry.Description = entryDto.Description;
            }
            else
            {
                transaction.Entries.Add(new TransactionEntry
                {
                    TransactionId = transaction.Id,
                    AccountId = entryDto.AccountId,
                    Amount = entryDto.Amount,
                    EntryType = entryDto.EntryType,
                    Description = entryDto.Description
                });
            }
        }

        var updatedTransaction = await _transactionRepository.UpdateAsync(transaction, entriesToRemove);
        
        var reloadedTransaction = await _transactionRepository.GetByIdAsync(updatedTransaction.Id);
        return MapToResponse(reloadedTransaction!);
    }

    public async Task DeleteAsync(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id) 
            ?? throw new NotFoundException("Transaction", id);

        if (transaction.Status != TransactionStatus.DRAFT)
        {
            throw new BusinessRuleException(
                $"Cannot delete a transaction in {transaction.Status} status. Only DRAFT transactions can be deleted.");
        }

        await _transactionRepository.DeleteAsync(transaction);
    }

    private void ValidateTransactionState(TransactionStatus status, IEnumerable<ITransactionEntryDto> entries)
    {
        if (status == TransactionStatus.POSTED || status == TransactionStatus.VOIDED)
        {
            throw new BusinessRuleException(
                "Transactions cannot be created or updated directly to POSTED or VOIDED status.");
        }

        var entryList = entries?.ToList() ?? new List<ITransactionEntryDto>();
        if (entryList.Count < 2)
        {
            throw new BusinessRuleException("A transaction must have at least two entries.");
        }

        if (status != TransactionStatus.DRAFT)
        {
            var totalDebits = entryList.Where(e => e.EntryType == EntryType.DEBIT).Sum(e => e.Amount);
            var totalCredits = entryList.Where(e => e.EntryType == EntryType.CREDIT).Sum(e => e.Amount);

            if (totalDebits != totalCredits)
            {
                throw new BusinessRuleException(
                    $"Double-entry validation failed. Total Debits ({totalDebits}) must equal Total Credits ({totalCredits}).");
            }
        }
    }

    private async Task ValidateAccountsAsync(IEnumerable<ITransactionEntryDto> entries)
    {
        var accountIds = entries.Select(e => e.AccountId).Distinct().ToList();
        
        foreach (var accountId in accountIds)
        {
            var account = await _accountRepository.GetByIdAsync(accountId) 
                ?? throw new NotFoundException("Account", accountId);

            if (!account.IsActive)
            {
                throw new BusinessRuleException($"Cannot post to inactive account: {account.Code} - {account.Name}");
            }
        }
    }

    private static TransactionResponseDto MapToResponse(Transaction transaction)
    {
        var creatorName = transaction.Creator != null 
            ? $"{transaction.Creator.FirstName} {transaction.Creator.LastName}" 
            : null;
            
        var approverName = transaction.Approver != null 
            ? $"{transaction.Approver.FirstName} {transaction.Approver.LastName}" 
            : null;

        return new TransactionResponseDto
        {
            Id = transaction.Id,
            ReferenceNumber = transaction.ReferenceNumber,
            Description = transaction.Description,
            Date = transaction.Date,
            Status = transaction.Status.ToString(),
            CreatedBy = transaction.CreatedBy,
            CreatorName = creatorName,
            ApprovedBy = transaction.ApprovedBy,
            ApproverName = approverName,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt,
            Entries = transaction.Entries.Select(e => new TransactionEntryResponseDto
            {
                Id = e.Id,
                AccountId = e.AccountId,
                AccountCode = e.Account?.Code ?? string.Empty,
                AccountName = e.Account?.Name ?? string.Empty,
                Amount = e.Amount,
                EntryType = e.EntryType.ToString(),
                Description = e.Description
            }).ToList()
        };
    }
}
