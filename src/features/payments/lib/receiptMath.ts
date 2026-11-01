// Money maths of a courier receipt. Everything is counted in cents (whole numbers), so 0.1 + 0.2 style rounding
// errors can never show a wrong fee to the admin. The service does the same sums again and decides.

export const toCents = (amount: number): number => Math.round(amount * 100);

/** "6900.00" -> 690000. Anything that is not an amount with at most two decimals gives null. */
export const parseAmountToCents = (text: string | undefined): number | null =>
  /^\d+(\.\d{1,2})?$/.test(text ?? '') ? toCents(Number(text)) : null;

/** What the courier kept: collected minus received. Null while no valid amount is typed. A negative number is a mistake. */
export const feesInCents = (collectedCents: number, receivedCents: number | null): number | null =>
  receivedCents === null ? null : collectedCents - receivedCents;

export const sumInCents = (amounts: number[]): number => amounts.reduce((sum, a) => sum + toCents(a), 0);
