import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { CreateProductRequest, Product } from '../../core/models/product';
import { Notifier } from '../../core/services/notifier';
import { ProductApi } from '../../core/services/product-api';

const URL_PATTERN = /^https?:\/\/\S+$/;
const INTEGER_PATTERN = /^\d+$/;

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
  private readonly productApi = inject(ProductApi);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    imageUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)],
    }),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.pattern(INTEGER_PATTERN)]),
  });

  ngOnInit(): void {
    const id = this.id();

    if (id) {
      this.form.controls.stock.disable();
      this.productApi.getById(Number(id)).subscribe((product) => this.form.patchValue(product));
    }
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
        this.notifier.success(this.isEdit() ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        this.router.navigate(['/products']);
      });
  }

  private saveRequest(): Observable<Product> {
    const id = this.id();
    const request = this.toRequest();

    return id ? this.productApi.update(Number(id), request) : this.productApi.create(request);
  }

  private toRequest(): CreateProductRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      description: value.description.trim(),
      category: value.category.trim(),
      imageUrl: value.imageUrl.trim(),
      price: Number(value.price),
      stock: Number(value.stock),
    };
  }
}
