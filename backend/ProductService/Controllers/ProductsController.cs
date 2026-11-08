using Microsoft.AspNetCore.Mvc;
using ProductService.Dtos;
using ProductService.Services;

namespace ProductService.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(IProductManagementService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductResponse>>> GetAll([FromQuery] ProductQuery query) =>
        Ok(await productService.GetPagedAsync(query));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id) =>
        Ok(await productService.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create(CreateProductRequest request)
    {
        var product = await productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> Update(int id, ProductRequest request) =>
        Ok(await productService.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await productService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:int}/stock")]
    public async Task<ActionResult<ProductResponse>> AdjustStock(int id, AdjustStockRequest request) =>
        Ok(await productService.AdjustStockAsync(id, request.QuantityChange));
}
