using DigitalLedger.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BalanceCheckerController : ControllerBase
{
    private readonly IBalanceCheckerService _balanceCheckerService;

    public BalanceCheckerController(IBalanceCheckerService balanceCheckerService)
    {
        _balanceCheckerService = balanceCheckerService;
    }

    [HttpPost("check")]
    public async Task<IActionResult> CheckBalance(IFormFile file)
    {
        using var csvStream = file.OpenReadStream();
        var balanceCheckResult = await _balanceCheckerService.CheckBalanceAsync(csvStream);
        return Ok(balanceCheckResult);
    }

    [HttpGet("template")]
    public IActionResult DownloadTemplate()
    {
        var templateBytes = _balanceCheckerService.GenerateTemplate();
        return File(templateBytes, "text/csv", "balance_checker_template.csv");
    }
}
