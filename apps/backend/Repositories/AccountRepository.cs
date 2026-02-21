using DigitalLedger.Api.Data;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigitalLedger.Api.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly ApplicationDbContext _context;

    public AccountRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Account>> GetAllAsync()
    {
        return await _context.Accounts.Where(a => a.IsActive).ToListAsync();
    }

    public async Task<Account?> GetByIdAsync(Guid id)
    {
        return await _context.Accounts.FindAsync(id);
    }
    
    public async Task<Account?> GetByCodeAsync(string code)
    {
        return await _context.Accounts.FirstOrDefaultAsync(a => a.Code == code);
    }

    public async Task<Account> CreateAsync(Account account)
    {
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        return account;
    }

    public async Task<Account> UpdateAsync(Account account)
    {
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();
        return account;
    }
}
