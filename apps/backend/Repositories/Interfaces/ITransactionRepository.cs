using DigitalLedger.Api.Models;

namespace DigitalLedger.Api.Repositories.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllAsync();
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction, List<TransactionEntry> entriesToRemove);
    Task DeleteAsync(Transaction transaction);
}
