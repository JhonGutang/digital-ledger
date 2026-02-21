using System.Security.Claims;
using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Models.DTOs.Transaction;
using DigitalLedger.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _transactionService.GetAllAsync();
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var transaction = await _transactionService.GetByIdAsync(id);
        return Ok(transaction);
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Create([FromBody] CreateTransactionDto createTransactionDto)
    {
        var userId = GetCurrentUserId();
        var transaction = await _transactionService.CreateAsync(createTransactionDto, userId);
        return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionDto updateTransactionDto)
    {
        var userId = GetCurrentUserId();
        var transaction = await _transactionService.UpdateAsync(id, updateTransactionDto, userId);
        return Ok(transaction);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _transactionService.DeleteAsync(id);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            throw new Exceptions.UnauthorizedException("User ID not found in token.");
        }
        return userId;
    }
}
