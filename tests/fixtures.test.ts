import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeStatic } from "../src/lib/analyze.ts";
import { BAND_ORDER, FIXTURES, bandInRange } from "../src/lib/fixtures.ts";
import type { RiskBand } from "../src/lib/types.ts";

describe("WOLF DEFENDER locked fixtures", () => {
  for (const fixture of FIXTURES) {
    it(fixture.id, () => {
      const report = analyzeStatic(fixture.input);
      const band = report.band as RiskBand;
      assert.ok(BAND_ORDER.includes(band), `${fixture.id}: unknown band ${band}`);
      assert.ok(
        bandInRange(band, fixture.minBand, fixture.maxBand),
        `${fixture.id}: band ${band} not in [${fixture.minBand}, ${fixture.maxBand}] (score ${report.risk})`,
      );
      const ids = report.indicators.map((item) => item.id);
      for (const id of fixture.mustDetect ?? []) {
        assert.ok(ids.includes(id), `${fixture.id}: missing indicator ${id} (have ${ids.join(", ")})`);
      }
      for (const id of fixture.mustNotDetect ?? []) {
        assert.ok(!ids.includes(id), `${fixture.id}: unexpected indicator ${id}`);
      }
      if (fixture.mustBlockFetch) {
        assert.equal(report.fetchAttempted, false, `${fixture.id}: must not fetch`);
        assert.ok(Boolean(report.blockedReason), `${fixture.id}: expected blockedReason`);
      }
    });
  }
});
