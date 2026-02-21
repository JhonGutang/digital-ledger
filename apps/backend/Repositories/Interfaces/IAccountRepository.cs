using DigitalLedger.Api.Models;

namespace DigitalLedger.Api.Repositories.Interfaces;

public interface IAccountRepository
{
    Task<List<Account>> GetAllAsync();
    Task<Account?> GetByIdAsync(Guid id);
    Task<Account?> GetByCodeAsync(string code);
    Task<Account> CreateAsync(Account account);
    Task<Account> UpdateAsync(Account account);
}
