using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Models.Enums;
using DigitalLedger.Api.Repositories.Interfaces;
using DigitalLedger.Api.Services.Interfaces;

namespace DigitalLedger.Api.Services;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accountRepository;

    public AccountService(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<List<AccountResponseDto>> GetAllAsync()
    {
        var accounts = await _accountRepository.GetAllAsync();
        return accounts.Select(MapToResponse).ToList();
    }

    public async Task<AccountResponseDto> GetByIdAsync(Guid id)
    {
        var account = await _accountRepository.GetByIdAsync(id) ?? throw new NotFoundException("Account", id);
        return MapToResponse(account);
    }

    public async Task<AccountResponseDto> CreateAsync(CreateAccountDto dto)
    {
        // Check for duplicate code
        var existingAccount = await _accountRepository.GetByCodeAsync(dto.Code);
        if (existingAccount != null)
        {
            throw new ConflictException($"An account with code '{dto.Code}' already exists.");
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Code = dto.Code,
            Name = dto.Name,
            Category = dto.Category,
            NormalBalance = DeriveNormalBalance(dto.Category),
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdAccount = await _accountRepository.CreateAsync(account);
        return MapToResponse(createdAccount);
    }

    public async Task<AccountResponseDto> UpdateAsync(Guid id, UpdateAccountDto dto)
    {
        var account = await _accountRepository.GetByIdAsync(id) ?? throw new NotFoundException("Account", id);
        
        account.Name = dto.Name;
        account.Description = dto.Description;
        account.UpdatedAt = DateTime.UtcNow;

        var updatedAccount = await _accountRepository.UpdateAsync(account);
        return MapToResponse(updatedAccount);
    }

    private static AccountResponseDto MapToResponse(Account account)
    {
        return new AccountResponseDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            Category = account.Category.ToString(),
            NormalBalance = account.NormalBalance.ToString(),
            Description = account.Description,
            IsActive = account.IsActive,
            CreatedAt = account.CreatedAt
        };
    }

    private static NormalBalance DeriveNormalBalance(AccountCategory category)
    {
        return category switch
        {
            AccountCategory.ASSET => NormalBalance.DEBIT,
            AccountCategory.EXPENSE => NormalBalance.DEBIT,
            AccountCategory.LIABILITY => NormalBalance.CREDIT,
            AccountCategory.EQUITY => NormalBalance.CREDIT,
            AccountCategory.REVENUE => NormalBalance.CREDIT,
            _ => throw new ValidationException("Invalid account category")
        };
    }
}
