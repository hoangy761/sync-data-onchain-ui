# Design Spec — Indexer UI (direction gate)

## Product
**Indexer** — ERC-20 holder balance indexer. Users look up current balance and Transfer-driven history for tokens synced from HyperEVM (chain 999), starting with NEST. Backend: NestJS at `localhost:3000`. Frontend target after direction pick: React + Vite + TypeScript + Tailwind.

## Audience & scene
Developers / on-chain analysts who already know explorers (Etherscan/Blockscout). Desktop-first (1m laptop). Primary jobs: paste holder address → see balance; check sync lag; skim history.

## Core messages & blocks
1. Brand: Indexer (light tone).
2. Global search: chain + token context + holder address.
3. Token strip: symbol, decimals, chain id, address.
4. Sync status: last processed / safe head / lag.
5. Balance result: raw + formatted.
6. History table: block, time, tx, delta, before/after.
7. Secondary: chain list, token list.

## Tone keywords
Clean · trustworthy · paper-light · precise · explorer-familiar · not SaaS-purple · not neon-dark.

## Output format
Direction drafts: interactive HTML mockups, viewport **1440×900**. Final implementation: SPA in `ui/` talking to Nest APIs.

## Constraints
- Light surfaces only (no default dark).
- No purple gradient / emoji icon rows / left-border accent cards.
- Amounts and blocks as strings (precision).
- Real product copy (NEST, HyperEVM, endpoints), no Lorem.

## Visual motif (from content)
**Ledger line** — hairline rules + mono addresses like a settlement book; one ink accent for “live / confirmed” state.

## Image need
Tool / data UI → decorative stock photos not required. Skip stock imagery.
