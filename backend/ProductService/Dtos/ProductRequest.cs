using System.ComponentModel.DataAnnotations;

namespace ProductService.Dtos;

public class ProductRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres.")]
    public string Description { get; init; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [StringLength(50, ErrorMessage = "La categoría no puede superar los 50 caracteres.")]
    public string Category { get; init; } = string.Empty;

    [Required(ErrorMessage = "La imagen es obligatoria.")]
    [Url(ErrorMessage = "La imagen debe ser una URL válida.")]
    [StringLength(500, ErrorMessage = "La URL de la imagen no puede superar los 500 caracteres.")]
    public string ImageUrl { get; init; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0.")]
    public decimal Price { get; init; }
}
