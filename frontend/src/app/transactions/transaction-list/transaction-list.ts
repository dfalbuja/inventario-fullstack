import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../../core/models/transaction';
import { Notifier } from '../../core/services/notifier';
import { ProductApi } from '../../core/services/product-api';
import { TransactionApi } from '../../core/services/transaction-api';

const FILTER_LABELS: Record<keyof TransactionFilters, string> = {
  productId: 'Producto',
  type: 'Tipo',
  dateFrom: 'Desde',
  dateTo: 'Hasta',
};

const HISTORY_COLUMNS = ['transactionDate', 'type', 'quantity', 'unitPrice', 'totalPrice', 'detail'];
const LIST_COLUMNS = ['transactionDate', 'product', ...HISTORY_COLUMNS.slice(1), 'actions'];

@Component({
  selector: 'app-transaction-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './transaction-list.html',
})
export class TransactionList implements OnInit {
  private readonly transactionApi = inject(TransactionApi);
  private readonly productApi = inject(ProductApi);
  private readonly notifier = inject(Notifier);

  readonly productId = input<number>();

  protected readonly isHistory = computed(() => this.productId() !== undefined);
  protected readonly columns = computed(() => (this.isHistory() ? HISTORY_COLUMNS : LIST_COLUMNS));
  protected readonly transactionTypes = TRANSACTION_TYPES;
  protected readonly typeLabels = TRANSACTION_TYPE_LABELS;

  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly productNames = computed(() => new Map(this.products().map((p) => [p.id, p.name])));
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  private readonly filters = signal<TransactionFilters>({});

  protected readonly activeFilters = computed(() =>
    (Object.keys(FILTER_LABELS) as (keyof TransactionFilters)[])
      .filter((key) => this.filters()[key] != null && this.filters()[key] !== '')
      .map((key) => ({ key, label: `${FILTER_LABELS[key]}: ${this.describeFilter(key)}` })),
  );

  protected readonly filterForm = new FormGroup({
    productId: new FormControl<number | null>(null),
    type: new FormControl<TransactionType | null>(null),
    dateFrom: new FormControl<string | null>(null),
    dateTo: new FormControl<string | null>(null),
  });

  ngOnInit(): void {
    if (!this.isHistory()) {
      this.productApi.getAll().subscribe((products) => this.products.set(products));
    }

    this.load();
  }

  protected typeLabel(type: TransactionType): string {
    return this.typeLabels[type];
  }

  protected productName(productId: number): string {
    return this.productNames().get(productId) ?? 'Producto eliminado';
  }

  protected applyFilters(): void {
    this.filters.set(this.filterForm.getRawValue());
    this.pageIndex.set(0);
    this.load();
  }

  protected removeFilter(key: keyof TransactionFilters): void {
    this.filterForm.controls[key].reset();
    this.applyFilters();
  }

  protected clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  protected changePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  protected delete(transaction: Transaction): void {
    if (!confirm('¿Eliminar la transacción? El stock del producto se ajustará.')) {
      return;
    }

    this.transactionApi.delete(transaction.id).subscribe(() => {
      this.notifier.success('Transacción eliminada y stock actualizado.');
      this.load();
    });
  }

  private describeFilter(key: keyof TransactionFilters): string {
    const value = this.filters()[key];

    if (key === 'productId') {
      return this.productName(Number(value));
    }

    if (key === 'type') {
      return this.typeLabel(value as TransactionType);
    }

    return String(value);
  }

  private load(): void {
    const filters = { ...this.filters(), productId: this.productId() ?? this.filters().productId };

    this.transactionApi.getPage(filters, this.pageIndex() + 1, this.pageSize()).subscribe((result) => {
      this.transactions.set(result.items);
      this.totalCount.set(result.totalCount);
    });
  }
}
