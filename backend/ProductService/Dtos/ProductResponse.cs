using ProductService.Models;

namespace ProductService.Dtos;

public sealed record ProductResponse(
    int Id,
    string Name,
    string Description,
    string Category,
    string ImageUrl,
    decimal Price,
    int Stock)
{
    public static ProductResponse FromEntity(Product product) => new(
        product.Id,
        product.Name,
        product.Description,
        product.Category,
        product.ImageUrl,
        product.Price,
        product.Stock);
}
