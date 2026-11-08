using TransactionService.Models;

namespace TransactionService.Dtos;

public sealed record TransactionResponse(
    int Id,
    DateTime TransactionDate,
    TransactionType Type,
    int ProductId,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    string? Detail)
{
    public static TransactionResponse FromEntity(Transaction transaction) => new(
        transaction.Id,
        transaction.TransactionDate,
        transaction.Type,
        transaction.ProductId,
        transaction.Quantity,
        transaction.UnitPrice,
        transaction.TotalPrice,
        transaction.Detail);
}
