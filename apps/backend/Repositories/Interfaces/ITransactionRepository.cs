using DigitalLedger.Api.Models;

namespace DigitalLedger.Api.Repositories.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllAsync();
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
    Task RemoveEntriesAsync(Guid transactionId);
}
