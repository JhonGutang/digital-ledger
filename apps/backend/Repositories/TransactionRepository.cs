using DigitalLedger.Api.Data;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigitalLedger.Api.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transaction>> GetAllAsync()
    {
        return await _context.Transactions
            .Include(t => t.Entries)
                .ThenInclude(e => e.Account)
            .Include(t => t.Creator)
            .Include(t => t.Approver)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions
            .Include(t => t.Entries)
                .ThenInclude(e => e.Account)
            .Include(t => t.Creator)
            .Include(t => t.Approver)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task DeleteAsync(Transaction transaction)
    {
        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveEntriesAsync(Guid transactionId)
    {
        var entries = await _context.TransactionEntries
            .Where(e => e.TransactionId == transactionId)
            .ToListAsync();
        _context.TransactionEntries.RemoveRange(entries);
        await _context.SaveChangesAsync();
    }
}
