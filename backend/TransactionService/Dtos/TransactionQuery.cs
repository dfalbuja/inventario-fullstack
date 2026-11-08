using System.ComponentModel.DataAnnotations;
using TransactionService.Models;

namespace TransactionService.Dtos;

public sealed class TransactionQuery
{
    public int? ProductId { get; init; }
    public TransactionType? Type { get; init; }
    public DateTime? DateFrom { get; init; }
    public DateTime? DateTo { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "La página debe ser mayor o igual a 1.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "El tamaño de página debe estar entre 1 y 100.")]
    public int PageSize { get; init; } = 10;
}
