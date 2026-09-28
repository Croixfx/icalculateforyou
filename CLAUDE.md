# CalculatorHub

A debt payoff calculator usable in almost every country, monetized with ads.
SEO focus: US, UK, Canada, Australia. The tool itself must work in any currency.

## Stack

- Next.js (App Router) + TypeScript, static export (`output: "export"` — no server at runtime)
- Tailwind CSS, mobile-first
- Vitest for tests

## Rules

- All financial math lives in `/lib/engine/` and must have tests.
- UI components never calculate; they call the engine.
- The engine is currency-agnostic; formatting happens only in `/lib/locale/`.
- Round money only for display, never during calculations.
- Pages must be fast and work on mobile.
- Keep dependencies minimal.
- Structure text so translations can be added later — no hardcoded strings scattered
  through components. Copy lives in `/lib/content/`, keyed by region.

## Structure

- `/lib/engine/` — pure math (rate conversion, amortization, multi-debt payoff strategies)
- `/lib/locale/` — currency formatting (`Intl.NumberFormat`) and browser locale/currency detection
- `/lib/content/` — per-region strings and metadata (US/UK/CA/AU + a global default)
- `/app/` — pages; `/us/`, `/uk/`, `/ca/`, `/au/` are SEO country sections, `/` is the global default
