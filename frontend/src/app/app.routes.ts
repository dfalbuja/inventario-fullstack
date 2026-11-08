import { Routes } from '@angular/router';
import { ProductDetail } from './products/product-detail/product-detail';
import { ProductForm } from './products/product-form/product-form';
import { ProductList } from './products/product-list/product-list';
import { TransactionForm } from './transactions/transaction-form/transaction-form';
import { TransactionList } from './transactions/transaction-list/transaction-list';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList },
  { path: 'products/new', component: ProductForm },
  { path: 'products/:id', component: ProductDetail },
  { path: 'products/:id/edit', component: ProductForm },
  { path: 'transactions', component: TransactionList },
  { path: 'transactions/new', component: TransactionForm },
  { path: 'transactions/:id/edit', component: TransactionForm },
  { path: '**', redirectTo: 'products' },
];
