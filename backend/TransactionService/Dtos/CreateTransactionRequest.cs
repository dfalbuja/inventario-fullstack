using System.ComponentModel.DataAnnotations;

namespace TransactionService.Dtos;

public sealed class CreateTransactionRequest : TransactionRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "El producto es obligatorio.")]
    public int ProductId { get; init; }
}
