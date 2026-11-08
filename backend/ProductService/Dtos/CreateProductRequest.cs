using System.ComponentModel.DataAnnotations;

namespace ProductService.Dtos;

public sealed class CreateProductRequest : ProductRequest
{
    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo.")]
    public int Stock { get; init; }
}
