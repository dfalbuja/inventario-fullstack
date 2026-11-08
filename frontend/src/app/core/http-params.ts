import { HttpParams } from '@angular/common/http';

type QueryValue = string | number | null | undefined;

export function toHttpParams(values: Record<string, QueryValue>): HttpParams {
  const definedValues = Object.entries(values).filter(
    (entry): entry is [string, string | number] =>
      entry[1] !== null && entry[1] !== undefined && entry[1] !== '',
  );

  return new HttpParams({ fromObject: Object.fromEntries(definedValues) });
}
