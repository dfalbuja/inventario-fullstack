import { ValidatorFn } from '@angular/forms';
import { TransactionType } from '../../core/models/transaction';

export function stockValidator(availableStock: (productId: number) => number | undefined): ValidatorFn {
  return (form) => {
    const productId = form.get('productId')?.value as number | null;
    const type = form.get('type')?.value as TransactionType;
    const quantity = Number(form.get('quantity')?.value);

    if (type !== 'Sale' || productId === null || !quantity) {
      return null;
    }

    const available = availableStock(productId);

    return available !== undefined && quantity > available ? { insufficientStock: { available } } : null;
  };
}
