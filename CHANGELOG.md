# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [v0.1.1] - 2026-10-16
### Changed
- Runtime dependencies upgraded: `@babel/parser` and `@babel/traverse` 7.29.7 → 8.0.7, `commander` 13.1.0 → 15.0.0, `zod` 3.25.76 → 4.6.6, `@modelcontextprotocol/sdk` 1.29.0 → 1.32.1. No source changes were needed; the test suite passes unchanged.
- Note: `@babel/*` 8 and `commander` 15 declare Node 22+ in their `engines` field, so `npm install` on Node 20 prints `EBADENGINE` warnings. Node 20 is still covered by CI.
- CI now tests on Node 20, 22 and 24. Dependabot opens weekly dependency updates and auto-merges patch/minor ones once CI passes.
- README: Korean summary at the top, standardized header badges and License section.

### Security
- Transitive dependency updates (lockfile only) for published advisories: `proxy-addr` 2.0.8 (GHSA-jqcg-44mw-7w3h), `fast-uri` 3.1.8 (GHSA-qw65-cvwx-89v3, GHSA-58mr-gqgx-xq4g, GHSA-hrr3-gc8f-f4qj), `ip-address` 10.7.4 (GHSA-rpw4-54j3-4h4q, GHSA-2vr4-cq9g-pvrc, GHSA-j6r3-76f7-8jcv, GHSA-h3mg-xc3c-68pw), plus `hono`, `@hono/node-server`, `body-parser` and `qs`.

## [v0.1.0] - 2026-06-19
### Added
- Initial public release.
