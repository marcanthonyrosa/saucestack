import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.config";
import { dbTestFiles } from "./vitest.route";

// -----------------------------------------------------------------------------
// The DATABASE suite — only the specs that need a real Postgres, run serially.
//
// Runs on merge to `main` and nightly, NOT on the pull-request path. The 201
// specs here are the slow half by construction, and for a repo with one
// committer the useful question is "did main break", which a post-merge run
// answers just as well as a pre-merge one — without paying for it on every
// intermediate commit of a stacked branch.
//
// `fileParallelism` stays FALSE (inherited from the base config): these files
// share one local Postgres and seed overlapping fixtures — e.g. marc@tmc.edu in
// both 0002-tmc-users-rls and 0003-programs — so running them concurrently
// collides on the partial-unique-email index in auth.users. That serialization
// is the whole reason the split exists: it is genuinely needed HERE, and was
// only ever accidental for the other 819.
//
// The caller must set ALLOW_DESTRUCTIVE_DB_TESTS=1 (see package.json). These
// tests truncate and delete-to-baseline, so `connectLocalPg` refuses without
// it — the guard that stops a stray run from wiping a populated dev :54322.
// -----------------------------------------------------------------------------
export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: dbTestFiles(),
      // Explicit rather than inherited, so this file states the constraint it
      // depends on instead of leaving it to a merge two files away.
      fileParallelism: false,
    },
  }),
);
