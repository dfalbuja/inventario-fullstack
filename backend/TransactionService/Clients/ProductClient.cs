using System.Net;
using Microsoft.AspNetCore.Mvc;
using TransactionService.Exceptions;

namespace TransactionService.Clients;

public sealed class ProductClient(HttpClient httpClient) : IProductClient
{
    public async Task AdjustStockAsync(int productId, int quantityChange)
    {
        var response = await httpClient.PatchAsJsonAsync($"api/products/{productId}/stock", new { quantityChange });

        if (response.IsSuccessStatusCode)
            return;

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        var message = problem?.Detail ?? "No fue posible actualizar el stock del producto.";

        throw response.StatusCode switch
        {
            HttpStatusCode.NotFound => new NotFoundException(message),
            HttpStatusCode.Conflict => new BusinessRuleException(message),
            _ => new HttpRequestException(message, null, response.StatusCode)
        };
    }
}
