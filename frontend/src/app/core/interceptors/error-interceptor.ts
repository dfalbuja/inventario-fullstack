import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { Notifier } from '../services/notifier';

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifier = inject(Notifier);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      notifier.error(toErrorMessage(error));
      return EMPTY;
    }),
  );
};

function toErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  const problem = error.error as ProblemDetails | null;

  if (problem?.errors) {
    return Object.values(problem.errors).flat().join(' ');
  }

  return problem?.detail ?? problem?.title ?? 'Ocurrió un error inesperado.';
}
