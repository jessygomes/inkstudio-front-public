/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the actual booking server action. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function booking({ connected = false, status = 201, response = { error: false } } = {}) {
  const testModule = { exports: {} };
  const calls = [];
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../lib/actions/appointment.action.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, {
    exports: testModule.exports, module: testModule, URLSearchParams,
    process: { env: { NEXT_PUBLIC_BACK_URL: "https://backend.example.test" } },
    require(name) { assert.equal(name, "../session"); return { getAuthHeaders: async () => ({ "Content-Type": "application/json", ...(connected ? { Authorization: "Bearer verified-session-token" } : {}) }) }; },
    fetch: async (url, options) => { calls.push({ url, options }); return Response.json(response, { status }); },
  });
  return { action: testModule.exports.createAppointmentByClient, calls };
}
for (const connected of [true, false]) test(`booking relies on server authentication instead of declared client identity (connected ${connected})`, async () => {
  const { action, calls } = booking({ connected });
  const input = { prestation: "PROJET", clientUserId: "victim", venueSalonId: "business-salon", clientEmail: "guest@example.test" };
  const result = await action("artist-profile", input, "forged-legacy-argument");
  assert.equal(result.ok, true);
  assert.equal(calls[0].url, "https://backend.example.test/appointments/by-client");
  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.clientUserId, undefined);
  assert.equal(payload.rdvBody.clientUserId, undefined);
  assert.equal(payload.rdvBody.venueSalonId, "business-salon");
  assert.equal(payload.userId, "artist-profile");
  assert.equal(calls[0].options.headers.Authorization, connected ? "Bearer verified-session-token" : undefined);
  assert.equal(input.clientUserId, "victim", "Do not mutate the caller's form state");
});
test("invalid credentials propagate as an authentication failure", async () => {
  const { action } = booking({ connected: true, status: 401, response: { message: "Unauthorized" } });
  const result = await action("salon", {});
  assert.equal(result.ok, false); assert.equal(result.status, 401);
});
test("business booking errors remain failures even with a successful HTTP response", async () => {
  const { action } = booking({ response: { error: true, message: "Booking refused" } });
  assert.equal((await action("salon", {})).ok, false);
});
test("the linked artist redirect contract is preserved", async () => {
  const { action } = booking({ response: { error: true, code: "LINKED_BOOKING_REDIRECT", performerUserId: "raven" } });
  const result = await action("gleamy", {});
  assert.equal(result.code, "LINKED_BOOKING_REDIRECT");
  assert.equal(result.performerUserId, "raven");
});
