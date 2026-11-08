using ProductService.Dtos;

namespace ProductService.Services;

public interface IProductManagementService
{
    Task<PagedResult<ProductResponse>> GetPagedAsync(ProductQuery query);
    Task<ProductResponse> GetByIdAsync(int id);
    Task<ProductResponse> CreateAsync(CreateProductRequest request);
    Task<ProductResponse> UpdateAsync(int id, ProductRequest request);
    Task DeleteAsync(int id);
    Task<ProductResponse> AdjustStockAsync(int id, int quantityChange);
}
