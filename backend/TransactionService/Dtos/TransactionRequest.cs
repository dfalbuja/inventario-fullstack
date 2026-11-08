using System.ComponentModel.DataAnnotations;
using TransactionService.Models;

namespace TransactionService.Dtos;

public class TransactionRequest
{
    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateTime? TransactionDate { get; init; }

    [Required(ErrorMessage = "El tipo de transacción es obligatorio.")]
    public TransactionType? Type { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0.")]
    public int Quantity { get; init; }

    [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0.")]
    public decimal UnitPrice { get; init; }

    [StringLength(500, ErrorMessage = "El detalle no puede superar los 500 caracteres.")]
    public string? Detail { get; init; }
}
