using TransactionService.Dtos;

namespace TransactionService.Services;

public interface ITransactionManagementService
{
    Task<PagedResult<TransactionResponse>> GetPagedAsync(TransactionQuery query);
    Task<TransactionResponse> GetByIdAsync(int id);
    Task<TransactionResponse> CreateAsync(CreateTransactionRequest request);
    Task<TransactionResponse> UpdateAsync(int id, TransactionRequest request);
    Task DeleteAsync(int id);
}
