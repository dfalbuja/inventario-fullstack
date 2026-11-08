import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toHttpParams } from '../http-params';
import { PagedResult } from '../models/paged-result';
import {
  CreateTransactionRequest,
  Transaction,
  TransactionFilters,
  TransactionRequest,
} from '../models/transaction';

@Injectable({ providedIn: 'root' })
export class TransactionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.transactionApiUrl;

  getPage(filters: TransactionFilters, page: number, pageSize: number): Observable<PagedResult<Transaction>> {
    return this.http.get<PagedResult<Transaction>>(this.baseUrl, {
      params: toHttpParams({ ...filters, page, pageSize }),
    });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, request);
  }

  update(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
