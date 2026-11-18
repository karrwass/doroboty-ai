# Windows line endings break the local gate

## Intent

`./scripts/verify` must give the same answer on a Windows checkout as on CI. With Git for Windows' default `core.autocrlf=true` and no `.gitattributes`, the working copy got CRLF endings, so `format:check` flagged 101 files and the byte-for-byte checks (`design-system:check`, `verify:packet`) failed without any real defect.

## Change

- Added `.gitattributes` (`* text=auto eol=lf`, common binaries marked `binary`).
- Normalized the existing working copy from CRLF to LF (content unchanged; `git diff --numstat` identical before and after apart from `.prettierignore`).
- Excluded the generated `docs/production-readiness.html` from Prettier; it is rendered by the production-readiness skill.

## Acceptance

- `git ls-files --eol` reports no `w/crlf` file.
- format:check, design-system:check, lint, typecheck, unit tests, verify:packet and build pass on Windows.

## Result (2026-11-18)

All of the above passed. Browser journeys: 37/37 passed on the installed Microsoft Edge through a temporary, git-ignored `artifacts/pw-msedge.config.ts`, because Playwright Chromium is not provisioned on this machine; an unmodified `./scripts/verify` still needs it. FEATURES.md was reviewed and needs no update (no behavior change).
