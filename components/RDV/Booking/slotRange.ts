/** Resolve an entire appointment from its start, excluding gaps and unavailable slots. */
export function getBookingSlotRange(
  start: string,
  count: number,
  availableStarts: string[],
  isUnavailable: (start: string) => boolean,
): string[] | null {
  const timestamp = Date.parse(start);
  if (!Number.isFinite(timestamp) || !Number.isInteger(count) || count < 1) return null;
  const available = new Map(availableStarts.map(value => [Date.parse(value), value]));
  const range: string[] = [];
  for (let index = 0; index < count; index++) {
    const value = available.get(timestamp + index * 30 * 60 * 1000);
    if (!value || isUnavailable(value)) return null;
    range.push(value);
  }
  return range;
}
