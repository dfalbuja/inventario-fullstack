namespace TransactionService.Models;

public sealed class Transaction
{
    public int Id { get; set; }
    public DateTime TransactionDate { get; set; }
    public TransactionType Type { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Detail { get; set; }

    public int StockEffect => Type == TransactionType.Purchase ? Quantity : -Quantity;
}
