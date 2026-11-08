using System.Text.Json.Serialization;

namespace TransactionService.Models;

[JsonConverter(typeof(JsonStringEnumConverter<TransactionType>))]
public enum TransactionType
{
    Purchase,
    Sale
}