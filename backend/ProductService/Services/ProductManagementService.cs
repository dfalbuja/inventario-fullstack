using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Dtos;
using ProductService.Exceptions;
using ProductService.Models;

namespace ProductService.Services;

public sealed class ProductManagementService(ProductDbContext context) : IProductManagementService
{
    public async Task<PagedResult<ProductResponse>> GetPagedAsync(ProductQuery query)
    {
        var products = ApplyFilters(context.Products.AsNoTracking(), query);

        var totalCount = await products.CountAsync();
        var items = await products
            .OrderBy(product => product.Name)
            .ThenBy(product => product.Id)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new PagedResult<ProductResponse>(
            items.Select(ProductResponse.FromEntity).ToList(),
            totalCount,
            query.Page,
            query.PageSize);
    }

    public async Task<ProductResponse> GetByIdAsync(int id) =>
        ProductResponse.FromEntity(await FindExistingAsync(id));

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
    {
        var product = new Product { Stock = request.Stock };
        ApplyChanges(product, request);

        context.Products.Add(product);
        await context.SaveChangesAsync();

        return ProductResponse.FromEntity(product);
    }

    public async Task<ProductResponse> UpdateAsync(int id, ProductRequest request)
    {
        var product = await FindExistingAsync(id);
        ApplyChanges(product, request);

        await context.SaveChangesAsync();

        return ProductResponse.FromEntity(product);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await FindExistingAsync(id);

        context.Products.Remove(product);
        await context.SaveChangesAsync();
    }

    public async Task<ProductResponse> AdjustStockAsync(int id, int quantityChange)
    {
        var updatedRows = await context.Products
            .Where(product => product.Id == id && product.Stock + quantityChange >= 0)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(product => product.Stock, product => product.Stock + quantityChange));

        var product = await FindExistingAsync(id);

        if (updatedRows == 0)
        {
            throw new BusinessRuleException(
                $"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}, requerido: {-quantityChange}.");
        }

        return ProductResponse.FromEntity(product);
    }

    private async Task<Product> FindExistingAsync(int id) =>
        await context.Products.FindAsync(id)
        ?? throw new NotFoundException($"No existe un producto con id {id}.");

    private static IQueryable<Product> ApplyFilters(IQueryable<Product> products, ProductQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Name))
            products = products.Where(product => product.Name.Contains(query.Name));

        if (!string.IsNullOrWhiteSpace(query.Category))
            products = products.Where(product => product.Category.Contains(query.Category));

        if (query.MinPrice.HasValue)
            products = products.Where(product => product.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            products = products.Where(product => product.Price <= query.MaxPrice.Value);

        return products;
    }

    private static void ApplyChanges(Product product, ProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Category = request.Category.Trim();
        product.ImageUrl = request.ImageUrl.Trim();
        product.Price = request.Price;
    }
}
