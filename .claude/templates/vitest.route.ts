import { readFileSync, readdirSync } from "node:fs";
import { join, posix, sep } from "node:path";

// -----------------------------------------------------------------------------
// saucestack test routing — which spec files need infrastructure, and which do
// not. Copy to vitest.route.ts at your repo root, alongside vitest.fast.config
// and vitest.db.config, and add the `test:fast` / `test:db` scripts.
//
// WHY THIS EXISTS. The obvious split — "unit tests live in tests/unit" —
// contradicts saucestack's own rule that tests are CO-LOCATED with the file
// they test. Follow both and your `tests/unit` directory holds almost nothing,
// so a CI gate pointed at it covers almost nothing. One audited repo had 1020
// spec files, 853 of them co-located, and a required check running the 5 that
// happened to live under tests/unit. It was green for months and gated nothing.
//
// The second failure is `fileParallelism: false`. It is the correct fix for the
// handful of suites that share one database, and setting it GLOBALLY — the only
// place vitest lets you set it — serializes every pure test behind them too.
// Same repo: 27 minutes for a suite whose fast half runs in 90 seconds.
//
// So route per file, by WHAT THE SOURCE ACTUALLY REACHES FOR. Not by directory
// (co-location makes paths meaningless) and not by filename convention (only 29
// of ~200 DB specs in that repo followed the `*.integration.test.ts` one).
//
// ADJUST THE MARKERS BELOW to your data layer. They are Supabase/Postgres here
// because that is the saucestack stack; the mechanism is what generalises.
//
// The two sets are COMPLEMENTS BY CONSTRUCTION: `dbTestFiles()` and
// `pureTestFiles()` partition the same walk, so no spec can fall through the
// gap and silently stop running. `vitest.route.test.ts` asserts exactly that —
// copy it too, it is the guard that keeps this honest.
// -----------------------------------------------------------------------------

/**
 * Directories never walked. `.claude` matters most: nested git worktrees live
 * at `.claude/worktrees/<branch>` and carry ANOTHER branch's specs, so sweeping
 * them in cross-runs someone else's suite against the shared DB and reports
 * their failures as ours.
 */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".claude",
  "coverage",
  "playwright-report",
  "test-results",
]);

/** Playwright specs use @playwright/test, not vitest. */
const SKIP_PATHS = ["tests/e2e"];

const IS_TEST = /\.test\.tsx?$/;

// The markers are EXPORTED, and built from fragments, for one reason: a spec
// that tests this router has to talk about them, and a file containing the
// literal token would classify ITSELF as needing a database. Composing them
// here keeps the vocabulary in one place and keeps the marker text out of every
// file that merely refers to it.
const RAW_PG_HELPER = "connect" + "LocalPg";

/** Reaches the raw shared Postgres. One gateway, so one marker. */
export const RAW_PG = new RegExp(RAW_PG_HELPER);

/** Mocks the Supabase client — so it opens no socket regardless of the below. */
export const MOCKS_SUPABASE = /vi\.mock\(\s*["'][^"']*supabase/i;

/** Talks to the local Supabase API/DB by URL or port. */
export const LIVE_SUPABASE =
  /createClient\(|createServerClient\(|NEXT_PUBLIC_SUPABASE_URL|5432[12]/;

function readSource(file: string): string {
  try {
    return readFileSync(file, "utf8");
  } catch {
    // A file that vanished between glob and read cannot need a database.
    return "";
  }
}

/** True when this spec needs a live Postgres (and possibly the Supabase API). */
export function needsDatabase(file: string): boolean {
  const src = readSource(file);
  if (RAW_PG.test(src)) return true;
  if (MOCKS_SUPABASE.test(src)) return false;
  return LIVE_SUPABASE.test(src);
}

/** `needsDatabase` for a spec path relative to `cwd`. */
function needsDatabaseRelative(cwd: string, rel: string): boolean {
  return needsDatabase(absolute(cwd, rel));
}

/**
 * Every vitest spec in the tree, as POSIX paths relative to `cwd`. Hand-rolled
 * rather than pulled from a glob package so the config has no dependency that
 * has to resolve before vitest can even decide what to run.
 */
function allTestFiles(cwd: string): string[] {
  const found: string[] = [];

  const walk = (dir: string, rel: string): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // unreadable directory is not a source of tests
    }
    for (const entry of entries) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        if (SKIP_PATHS.includes(childRel)) continue;
        walk(join(dir, entry.name), childRel);
      } else if (entry.isFile() && IS_TEST.test(entry.name)) {
        found.push(childRel);
      }
    }
  };

  walk(cwd, "");
  return found.sort();
}

/** Resolve a relative spec path against `cwd` for reading. */
function absolute(cwd: string, rel: string): string {
  return join(cwd, rel.split(posix.sep).join(sep));
}

/** Both halves plus the total. The two halves always partition `all`. */
export function partition(cwd: string = process.cwd()): {
  all: string[];
  db: string[];
  pure: string[];
} {
  const all = allTestFiles(cwd);
  const db: string[] = [];
  const pure: string[] = [];
  for (const f of all) {
    (needsDatabaseRelative(cwd, f) ? db : pure).push(f);
  }
  return { all, db, pure };
}

/** Specs that need a database — run serially, against a disposable stack. */
export function dbTestFiles(cwd: string = process.cwd()): string[] {
  return partition(cwd).db;
}

/** Specs that need nothing — safe to run fully parallel, with no stack at all. */
export function pureTestFiles(cwd: string = process.cwd()): string[] {
  return partition(cwd).pure;
}
