import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product';
import { ProductApi } from '../../core/services/product-api';
import { TransactionList } from '../../transactions/transaction-list/transaction-list';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe, MatCardModule, MatButtonModule, TransactionList],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  private readonly productApi = inject(ProductApi);

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);

  ngOnInit(): void {
    this.productApi.getById(Number(this.id())).subscribe((product) => this.product.set(product));
  }
}
