import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Product, ProductFilters } from '../../core/models/product';
import { Notifier } from '../../core/services/notifier';
import { ProductApi } from '../../core/services/product-api';

const FILTER_LABELS: Record<keyof ProductFilters, string> = {
  name: 'Nombre',
  category: 'Categoría',
  minPrice: 'Precio mínimo',
  maxPrice: 'Precio máximo',
};

@Component({
  selector: 'app-product-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productApi = inject(ProductApi);
  private readonly notifier = inject(Notifier);

  protected readonly columns = ['image', 'name', 'category', 'price', 'stock', 'actions'];
  protected readonly products = signal<Product[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  private readonly filters = signal<ProductFilters>({});

  protected readonly activeFilters = computed(() =>
    (Object.keys(FILTER_LABELS) as (keyof ProductFilters)[])
      .filter((key) => this.filters()[key] != null && this.filters()[key] !== '')
      .map((key) => ({ key, label: `${FILTER_LABELS[key]}: ${this.filters()[key]}` })),
  );

  protected readonly filterForm = new FormGroup({
    name: new FormControl<string | null>(null),
    category: new FormControl<string | null>(null),
    minPrice: new FormControl<number | null>(null),
    maxPrice: new FormControl<number | null>(null),
  });

  constructor() {
    this.load();
  }

  protected applyFilters(): void {
    this.filters.set(this.filterForm.getRawValue());
    this.pageIndex.set(0);
    this.load();
  }

  protected removeFilter(key: keyof ProductFilters): void {
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

  protected delete(product: Product): void {
    if (!confirm(`¿Eliminar el producto "${product.name}"?`)) {
      return;
    }

    this.productApi.delete(product.id).subscribe(() => {
      this.notifier.success('Producto eliminado correctamente.');
      this.load();
    });
  }

  private load(): void {
    this.productApi
      .getPage(this.filters(), this.pageIndex() + 1, this.pageSize())
      .subscribe((result) => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }
}
