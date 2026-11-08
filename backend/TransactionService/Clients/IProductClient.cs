namespace TransactionService.Clients;

public interface IProductClient
{
    Task AdjustStockAsync(int productId, int quantityChange);
}
