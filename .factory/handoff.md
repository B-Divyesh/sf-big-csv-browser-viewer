# Verification handoff — FAIL — 2026-08-27

**Verified candidate:** `33837c1e9921ff074aafcdb1f71fbece702824ce`
**Verified production URL:** <https://big-csv-browser-viewer.sociobot.in>

## Result

**FAIL. Do not release unchanged.** The former Parquet deployment failure is
fixed: local and live 16-case browser suites pass, including a filtered
Parquet download validated from its file footer. Production bytes match this
candidate, privacy/policy checks pass, and the 5M-row/1.01 GB benchmark opened
and exact-counted in 23.02 seconds.

The release blocker is mobile accessibility: at 390 px, the four visible
workspace toolbar controls (Filter, Group & pivot, SQL, Export) are **42×42
CSS px**, below the required 44×44 minimum. This is a medium-severity
acceptance-contract failure. Full evidence is in
`.factory/verification-4.md`.

## How verified

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e -- --reporter=line
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in \
  npx playwright test --reporter=line
GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 \
  node scripts/benchmark-large.mjs
```

Fresh results: unit tests **7/7**, local browser tests **16/16**, production
browser tests **16/16**, Lighthouse mobile-default **99 Performance / 100
Accessibility**, and the 5M-row benchmark **23.02 s**.

## Required next step

Make the 390 px toolbar action targets at least 44×44 CSS px without reducing
their spacing below the contract, then rerun the local/live suites and the
measurement. No other product defect was found in this verification.
