import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toHttpParams } from '../http-params';
import { PagedResult } from '../models/paged-result';
import { CreateProductRequest, Product, ProductFilters, ProductRequest } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.productApiUrl;

  getPage(filters: ProductFilters, page: number, pageSize: number): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(this.baseUrl, {
      params: toHttpParams({ ...filters, page, pageSize }),
    });
  }

  getAll(): Observable<Product[]> {
    return this.getPage({}, 1, 100).pipe(map((result) => result.items));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, request);
  }

  update(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
