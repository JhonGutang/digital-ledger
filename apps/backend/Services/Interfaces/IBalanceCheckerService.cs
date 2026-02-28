using DigitalLedger.Api.Models.DTOs.BalanceChecker;

namespace DigitalLedger.Api.Services.Interfaces;

public interface IBalanceCheckerService
{
    Task<BalanceCheckResultDto> CheckBalanceAsync(Stream csvStream);
    byte[] GenerateTemplate();
}
