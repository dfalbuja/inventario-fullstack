using Microsoft.EntityFrameworkCore;
using TransactionService.Clients;
using TransactionService.Data;
using TransactionService.Dtos;
using TransactionService.Exceptions;
using TransactionService.Models;

namespace TransactionService.Services;

public sealed class TransactionManagementService(TransactionDbContext context, IProductClient productClient)
    : ITransactionManagementService
{
    public async Task<PagedResult<TransactionResponse>> GetPagedAsync(TransactionQuery query)
    {
        var transactions = ApplyFilters(context.Transactions.AsNoTracking(), query);

        var totalCount = await transactions.CountAsync();
        var items = await transactions
            .OrderByDescending(transaction => transaction.TransactionDate)
            .ThenByDescending(transaction => transaction.Id)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new PagedResult<TransactionResponse>(
            items.Select(TransactionResponse.FromEntity).ToList(),
            totalCount,
            query.Page,
            query.PageSize);
    }

    public async Task<TransactionResponse> GetByIdAsync(int id) =>
        TransactionResponse.FromEntity(await FindExistingAsync(id));

    public async Task<TransactionResponse> CreateAsync(CreateTransactionRequest request)
    {
        var transaction = new Transaction { ProductId = request.ProductId };
        ApplyChanges(transaction, request);

        await productClient.AdjustStockAsync(transaction.ProductId, transaction.StockEffect);
        context.Transactions.Add(transaction);
        await SaveOrRevertStockAsync(transaction.ProductId, transaction.StockEffect);

        return TransactionResponse.FromEntity(transaction);
    }

    public async Task<TransactionResponse> UpdateAsync(int id, TransactionRequest request)
    {
        var transaction = await FindExistingAsync(id);
        var previousStockEffect = transaction.StockEffect;
        ApplyChanges(transaction, request);
        var stockChange = transaction.StockEffect - previousStockEffect;

        await productClient.AdjustStockAsync(transaction.ProductId, stockChange);
        await SaveOrRevertStockAsync(transaction.ProductId, stockChange);

        return TransactionResponse.FromEntity(transaction);
    }

    public async Task DeleteAsync(int id)
    {
        var transaction = await FindExistingAsync(id);
        var stockChange = -transaction.StockEffect;

        await productClient.AdjustStockAsync(transaction.ProductId, stockChange);
        context.Transactions.Remove(transaction);
        await SaveOrRevertStockAsync(transaction.ProductId, stockChange);
    }

    private async Task SaveOrRevertStockAsync(int productId, int stockChange)
    {
        try
        {
            await context.SaveChangesAsync();
        }
        catch
        {
            await productClient.AdjustStockAsync(productId, -stockChange);
            throw;
        }
    }

    private async Task<Transaction> FindExistingAsync(int id) =>
        await context.Transactions.FindAsync(id)
        ?? throw new NotFoundException($"No existe una transacción con id {id}.");

    private static IQueryable<Transaction> ApplyFilters(IQueryable<Transaction> transactions, TransactionQuery query)
    {
        if (query.ProductId.HasValue)
            transactions = transactions.Where(transaction => transaction.ProductId == query.ProductId.Value);

        if (query.Type.HasValue)
            transactions = transactions.Where(transaction => transaction.Type == query.Type.Value);

        if (query.DateFrom.HasValue)
            transactions = transactions.Where(transaction => transaction.TransactionDate >= query.DateFrom.Value.Date);

        if (query.DateTo.HasValue)
            transactions = transactions.Where(transaction =>
                transaction.TransactionDate < query.DateTo.Value.Date.AddDays(1));

        return transactions;
    }

    private static void ApplyChanges(Transaction transaction, TransactionRequest request)
    {
        transaction.TransactionDate = request.TransactionDate!.Value;
        transaction.Type = request.Type!.Value;
        transaction.Quantity = request.Quantity;
        transaction.UnitPrice = request.UnitPrice;
        transaction.TotalPrice = request.Quantity * request.UnitPrice;
        transaction.Detail = string.IsNullOrWhiteSpace(request.Detail) ? null : request.Detail.Trim();
    }
}
