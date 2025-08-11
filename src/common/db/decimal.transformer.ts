import { ValueTransformer } from 'typeorm';

/**
 * Stores decimal values as string in JS, numeric in PG
 */
export class DecimalTransformer implements ValueTransformer {
  to(value?: string | number | null): string | null {
    if (value === undefined || value === null) return null;
    return typeof value === 'number' ? value.toString() : value;
  }
  from(value: string | null): string | null {
    return value;
  }
}
