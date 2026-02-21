using DigitalLedger.Api.Models.DTOs.Transaction;

namespace DigitalLedger.Api.Services.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionResponseDto>> GetAllAsync();
    Task<TransactionResponseDto> GetByIdAsync(Guid id);
    Task<TransactionResponseDto> CreateAsync(CreateTransactionDto createTransactionDto, Guid userId);
    Task<TransactionResponseDto> UpdateAsync(Guid id, UpdateTransactionDto updateTransactionDto, Guid userId);
    Task DeleteAsync(Guid id);
}
