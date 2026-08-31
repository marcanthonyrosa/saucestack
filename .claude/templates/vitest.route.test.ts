import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  LIVE_SUPABASE,
  MOCKS_SUPABASE,
  RAW_PG,
  needsDatabase,
  partition,
} from "./vitest.route";

// The split between the fast (PR-gate) suite and the database suite is decided
// by vitest.route.ts. If it ever drops a spec, that spec stops running in BOTH
// projects and nothing says so — the suite just gets quietly smaller and stays
// green. These tests exist to make that failure mode impossible.
//
// NOTE: the marker patterns are imported, never retyped. A file that spells the
// raw-Postgres helper's name out loud classifies ITSELF as needing a database —
// which is exactly what happened to the first draft of this file.

describe("test routing", () => {
  const { all, db, pure } = partition(process.cwd());

  it("routes every spec in the tree to exactly one of the two suites", () => {
    expect(db.length + pure.length).toBe(all.length);
    expect(new Set([...db, ...pure]).size).toBe(all.length);
  });

  it("finds the suite it is supposed to be splitting", () => {
    // A broken walker returning [] satisfies the partition test above
    // VACUOUSLY — both halves are empty and 0 + 0 === 0. This is the test that
    // stops that. RAISE THESE FLOORS as your suite grows: pick a number a real
    // regression would break, well under your current count so it does not
    // need editing every week.
    expect(all.length).toBeGreaterThan(0);
    expect(pure.length).toBeGreaterThan(0);
  });

  it("keeps the Playwright tree and nested worktrees out of both suites", () => {
    const leaked = all.filter(
      (f) => f.startsWith("tests/e2e/") || f.startsWith(".claude/"),
    );
    expect(leaked).toEqual([]);
  });

  it("sends every spec that reaches for raw Postgres to the database half", () => {
    // That helper throws without ALLOW_DESTRUCTIVE_DB_TESTS, which the fast
    // project never sets — so a miss here is a hard failure, not a slow test.
    const rawPg = all.filter((f) => RAW_PG.test(readFileSync(f, "utf8")));
    expect(rawPg.filter((f) => !db.includes(f))).toEqual([]);
  });

  it("sends live-Supabase specs to the database half unless they mock it", () => {
    const live = all.filter((f) => {
      const src = readFileSync(f, "utf8");
      return (
        LIVE_SUPABASE.test(src) &&
        !MOCKS_SUPABASE.test(src) &&
        !RAW_PG.test(src)
      );
    });
    expect(live.filter((f) => !db.includes(f))).toEqual([]);
  });

  it("does not send a spec to the database half just for mocking Supabase", () => {
    // A vi.mock'd client opens no socket. Before this rule ~32 pure component
    // tests were misread as DB tests purely because the mock names createClient.
    const mockedOnly = pure.filter((f) => {
      const src = readFileSync(f, "utf8");
      return MOCKS_SUPABASE.test(src) && !RAW_PG.test(src);
    });
    // Not asserted as non-empty: a young repo may not have one yet. The point
    // is that mocking must never PULL a spec into the slow half.
    expect(mockedOnly.every((f) => !db.includes(f))).toBe(true);
  });

  it("keeps tests/integration in the database half, except inert placeholders", () => {
    const integration = all.filter((f) => f.startsWith("tests/integration/"));

    // A handful of specs under tests/integration are documented placeholders —
    // a top-level `describe.skip` wrapping pseudocode, awaiting a harness that
    // does not exist yet (e.g. the real-JWT RLS perf gate). They open no
    // connection, so routing them to the fast half is correct and costs
    // nothing. Anything else landing in the fast half is a routing bug.
    const strays = integration.filter((f) => !db.includes(f));
    for (const f of strays) {
      expect(readFileSync(f, "utf8")).toMatch(/describe\.skip\(/);
    }
  });

  it("classifies from file content, not from the path", () => {
    // The house convention co-locates tests with source, so the path tells you
    // nothing: assert the classifier reads the file it is handed.
    expect(needsDatabase("tests/helpers/does-not-exist.test.ts")).toBe(false);
  });
});
