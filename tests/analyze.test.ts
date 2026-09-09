import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeStatic } from "../src/lib/analyze.ts";
import { COMPAT_FIXTURES } from "../src/lib/fixtures.ts";
import { bandFor } from "../src/lib/score.ts";

const order: Record<string, number> = { LOW: 0, GUARDED: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

for (const fx of COMPAT_FIXTURES) {
  test(`fixture ${fx.id}`, () => {
    const report = analyzeStatic(fx.input);
    if (fx.expectIds) {
      for (const id of fx.expectIds) {
        assert.ok(
          report.indicators.some((item) => item.id === id),
          `${fx.id} missing ${id}; got ${report.indicators.map((item) => item.id).join(",")}`,
        );
      }
    }
    if (fx.rejectIds) {
      for (const id of fx.rejectIds) {
        assert.ok(!report.indicators.some((item) => item.id === id), `${fx.id} should not flag ${id}`);
      }
    }
    if (fx.expectBandMin) {
      assert.ok(order[report.band] >= order[fx.expectBandMin], `${fx.id} band ${report.band} < ${fx.expectBandMin}`);
    }
    assert.equal(bandFor(report.risk), report.band);
  });
}

test("private IP is blocked and high risk", () => {
  const report = analyzeStatic("http://192.168.1.10/admin");
  assert.ok(report.blockedReason);
  assert.ok(report.risk >= 80);
});
