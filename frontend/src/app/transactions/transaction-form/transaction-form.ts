import { CurrencyPipe, Location } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, finalize, map } from 'rxjs';
import { Product } from '../../core/models/product';
import {
  CreateTransactionRequest,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  Transaction,
  TransactionType,
} from '../../core/models/transaction';
import { Notifier } from '../../core/services/notifier';
import { ProductApi } from '../../core/services/product-api';
import { TransactionApi } from '../../core/services/transaction-api';
import { stockValidator } from './stock-validator';

const INTEGER_PATTERN = /^\d+$/;

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, CurrencyPipe, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './transaction-form.html',
})
export class TransactionForm implements OnInit {
  private readonly transactionApi = inject(TransactionApi);
  private readonly productApi = inject(ProductApi);
  private readonly notifier = inject(Notifier);
  private readonly location = inject(Location);

  readonly id = input<string>();
  readonly productId = input<string>();

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);
  protected readonly products = signal<Product[]>([]);
  protected readonly transactionTypes = TRANSACTION_TYPES;
  protected readonly typeLabels = TRANSACTION_TYPE_LABELS;
  private originalStockEffect = 0;

  protected readonly form = new FormGroup(
    {
      productId: new FormControl<number | null>(null, Validators.required),
      type: new FormControl<TransactionType>('Sale', { nonNullable: true, validators: Validators.required }),
      transactionDate: new FormControl(currentLocalDateTime(), { nonNullable: true, validators: Validators.required }),
      quantity: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(INTEGER_PATTERN),
      ]),
      unitPrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      detail: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
    },
    { validators: stockValidator((productId) => this.availableStock(productId)) },
  );

  private readonly formValue = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly selectedProductStock = computed(() => {
    const productId = this.formValue().productId;
    return productId === null ? undefined : this.availableStock(productId);
  });

  protected readonly total = computed(
    () => Number(this.formValue().quantity ?? 0) * Number(this.formValue().unitPrice ?? 0),
  );

  constructor() {
    this.form.controls.productId.valueChanges.pipe(takeUntilDestroyed()).subscribe((productId) => {
      const product = this.findProduct(productId);

      if (product && !this.isEdit()) {
        this.form.controls.unitPrice.setValue(product.price);
      }
    });
  }

  ngOnInit(): void {
    this.productApi.getAll().subscribe((products) => {
      this.products.set(products);
      this.initializeForm();
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.saveRequest()
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe(() => {
        this.notifier.success(
          this.isEdit() ? 'Transacción actualizada y stock ajustado.' : 'Transacción registrada y stock actualizado.',
        );
        this.location.back();
      });
  }

  protected cancel(): void {
    this.location.back();
  }

  private initializeForm(): void {
    const id = this.id();
    const productId = this.productId();

    if (id) {
      this.transactionApi.getById(Number(id)).subscribe((transaction) => this.loadTransaction(transaction));
    } else if (productId) {
      this.form.controls.productId.setValue(Number(productId));
    }
  }

  private loadTransaction(transaction: Transaction): void {
    this.originalStockEffect = transaction.type === 'Purchase' ? transaction.quantity : -transaction.quantity;
    this.form.controls.productId.disable();
    this.form.patchValue({
      ...transaction,
      transactionDate: transaction.transactionDate.slice(0, 16),
      detail: transaction.detail ?? '',
    });
  }

  private availableStock(productId: number): number | undefined {
    const product = this.findProduct(productId);
    return product ? product.stock - this.originalStockEffect : undefined;
  }

  private findProduct(productId: number | null): Product | undefined {
    return this.products().find((product) => product.id === productId);
  }

  private saveRequest(): Observable<Transaction> {
    const id = this.id();
    const request = this.toRequest();

    return id ? this.transactionApi.update(Number(id), request) : this.transactionApi.create(request);
  }

  private toRequest(): CreateTransactionRequest {
    const value = this.form.getRawValue();

    return {
      productId: Number(value.productId),
      type: value.type,
      transactionDate: value.transactionDate,
      quantity: Number(value.quantity),
      unitPrice: Number(value.unitPrice),
      detail: value.detail.trim() || null,
    };
  }
}

function currentLocalDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
