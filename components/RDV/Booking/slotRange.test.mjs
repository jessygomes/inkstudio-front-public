import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getBookingSlotRange } from "./slotRange.ts";

const starts = ["2026-11-02T09:00:00.000Z", "2026-11-02T09:30:00.000Z", "2026-11-02T10:00:00.000Z"];

describe("appointment start selection", () => {
  it("reserves the full consecutive duration in one selection", () => {
    assert.deepEqual(getBookingSlotRange(starts[0], 3, starts, () => false), starts);
  });
  it("rejects starts without enough time remaining", () => {
    assert.equal(getBookingSlotRange(starts[2], 2, starts, () => false), null);
  });
  it("rejects a gap inside an appointment", () => {
    assert.equal(getBookingSlotRange(starts[0], 3, [starts[0], starts[2]], () => false), null);
  });
  it("rejects a blocked or occupied slot inside the duration", () => {
    assert.equal(getBookingSlotRange(starts[0], 3, starts, value => value === starts[1]), null);
  });
  it("compares equivalent ISO timestamps without losing the API representation", () => {
    assert.deepEqual(getBookingSlotRange("2026-11-02T10:00:00+01:00", 1, starts, () => false), [starts[0]]);
  });
  it("supports a single half-hour appointment", () => {
    assert.deepEqual(getBookingSlotRange(starts[2], 1, starts, () => false), [starts[2]]);
  });
  it("rejects invalid dates and durations", () => {
    for (const count of [0, -1, 1.5, NaN]) assert.equal(getBookingSlotRange(starts[0], count, starts, () => false), null);
    assert.equal(getBookingSlotRange("invalid", 1, starts, () => false), null);
  });
});
