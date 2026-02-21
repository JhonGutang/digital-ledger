using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await _accountService.GetAllAsync();
        return Ok(accounts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var account = await _accountService.GetByIdAsync(id);
        return Ok(account);
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto createAccountDto)
    {
        var account = await _accountService.CreateAsync(createAccountDto);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccountDto updateAccountDto)
    {
        var account = await _accountService.UpdateAsync(id, updateAccountDto);
        return Ok(account);
    }
}
