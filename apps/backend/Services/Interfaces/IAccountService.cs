using DigitalLedger.Api.Models.DTOs.Account;

namespace DigitalLedger.Api.Services.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponseDto>> GetAllAsync();
    Task<AccountResponseDto> GetByIdAsync(Guid id);
    Task<AccountResponseDto> CreateAsync(CreateAccountDto createAccountDto);
    Task<AccountResponseDto> UpdateAsync(Guid id, UpdateAccountDto updateAccountDto);
}
