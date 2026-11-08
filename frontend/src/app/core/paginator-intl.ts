import { MatPaginatorIntl } from '@angular/material/paginator';

export function spanishPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Registros por página';
  intl.firstPageLabel = 'Primera página';
  intl.previousPageLabel = 'Página anterior';
  intl.nextPageLabel = 'Página siguiente';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page, pageSize, length) => {
    const start = length === 0 ? 0 : page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} – ${end} de ${length}`;
  };

  return intl;
}
