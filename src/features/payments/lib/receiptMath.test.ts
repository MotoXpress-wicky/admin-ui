import { describe, expect, it } from 'vitest';
import { feesInCents, parseAmountToCents, sumInCents, toCents } from './receiptMath';

describe('toCents', () => {
  it('turns an amount into whole cents without a rounding error', () => {
    expect(toCents(4200)).toBe(420000);
    expect(toCents(1750.5)).toBe(175050);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 as a plain number
  });
});

describe('sumInCents', () => {
  it('adds amounts exactly', () => {
    expect(sumInCents([4200, 3000])).toBe(720000);
    expect(sumInCents([0.1, 0.2])).toBe(30);
    expect(sumInCents([])).toBe(0);
  });
});

describe('parseAmountToCents', () => {
  it('accepts an amount with at most two decimals', () => {
    expect(parseAmountToCents('6900')).toBe(690000);
    expect(parseAmountToCents('6900.5')).toBe(690050);
    expect(parseAmountToCents('6900.50')).toBe(690050);
    expect(parseAmountToCents('0')).toBe(0);
  });

  it('refuses everything else', () => {
    for (const bad of ['', ' ', 'abc', '12.345', '-5', '1,000.00', '1e3', '12.', '.5']) {
      expect(parseAmountToCents(bad), `"${bad}"`).toBeNull();
    }
    expect(parseAmountToCents(undefined)).toBeNull();
  });
});

describe('feesInCents', () => {
  it('is what the courier kept: collected minus received', () => {
    expect(feesInCents(720000, 690000)).toBe(30000);
    expect(feesInCents(720000, 720000)).toBe(0);
  });

  it('is null while no valid amount is typed, and negative when more arrived than was collected', () => {
    expect(feesInCents(720000, null)).toBeNull();
    expect(feesInCents(720000, 730000)).toBe(-10000);
  });
});
