import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.config";
import { pureTestFiles } from "./vitest.route";

// -----------------------------------------------------------------------------
// The FAST suite — every spec that needs no database, run fully parallel.
//
// This is the PR gate. It is the required status check on `main`, and it is the
// only Actions job on the pull-request path.
//
// The number that justifies it: 819 of the repo's 1020 specs touch no database
// at all (`vitest.route.ts` decides, per file, from what the source actually
// reaches for). Under the old single config they were serialized behind the 201
// that do — `fileParallelism: false` is global — so the full suite took 27
// minutes and was the ONLY place those 819 ran. They also gated nothing: the
// required check ran `vitest run tests/unit`, which is five meta-tests.
//
// Two things make this safe to run without a Supabase stack:
//   • Routing is by CONTENT, not path, so a new DB-coupled test lands in the DB
//     half automatically rather than silently joining this one.
//   • `ALLOW_DESTRUCTIVE_DB_TESTS` is deliberately NOT set here. If a spec is
//     ever misrouted into this project and reaches for the shared Postgres,
//     `connectLocalPg` throws its loud refusal instead of hanging or, worse,
//     connecting to a developer's populated :54322. A misroute is a red test
//     with a clear message, not a silent pass.
// -----------------------------------------------------------------------------
export default mergeConfig(
  base,
  defineConfig({
    test: {
      // An explicit file list, not a glob: the two projects are complements of
      // one partition, so nothing can fall between them. Asserted by
      // vitest.route.test.ts.
      include: pureTestFiles(),
      // Undo the base config's global serialization. Nothing here shares state,
      // so files can run across all cores.
      fileParallelism: true,
      // Non-secret placeholders for env read at MODULE SCOPE. Some modules
      // build a Supabase client as a top-level const — lib/supabase/server-admin
      // does — so merely importing the module under test can throw
      // "supabaseUrl is required" before a single mock is installed. That is an
      // import-time concern, not a database one: these specs mock the data layer
      // and never open a socket. ci.yml already carries the same class of
      // placeholder for TMC_AUTH_* and RESEND_*.
      //
      // The URL is deliberately unroutable. If a spec in this project ever DOES
      // try to reach the network, it fails loudly here rather than silently
      // finding a developer's real stack on :54321.
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:1/placeholder-not-routable",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon_placeholder_for_module_init",
        SUPABASE_SERVICE_ROLE_KEY: "service_placeholder_for_module_init",
      },
    },
  }),
);
