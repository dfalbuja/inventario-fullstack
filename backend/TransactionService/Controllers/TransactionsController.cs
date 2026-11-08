using Microsoft.AspNetCore.Mvc;
using TransactionService.Dtos;
using TransactionService.Services;

namespace TransactionService.Controllers;

[ApiController]
[Route("api/transactions")]
public sealed class TransactionsController(ITransactionManagementService transactionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<TransactionResponse>>> GetAll([FromQuery] TransactionQuery query) =>
        Ok(await transactionService.GetPagedAsync(query));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> GetById(int id) =>
        Ok(await transactionService.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> Create(CreateTransactionRequest request)
    {
        var transaction = await transactionService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> Update(int id, TransactionRequest request) =>
        Ok(await transactionService.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await transactionService.DeleteAsync(id);
        return NoContent();
    }
}
