# Dashboard Builder (Business Intelligence & Analytics)

`/app/dashboard-builder` — drag-and-drop dashboards with configurable charts over the contacts, deals and
companies already stored in Supabase. Charts, aggregates and the iframe widget are **Twenty's own code**
(`src/vendor/twenty`), rendered in this app's design; there is no Twenty backend.

## What comes from Twenty (vendored, unmodified)
Copied from `twentyhq/twenty` (`packages/twenty-front/src`, `twenty-shared/src`, plus the three symbols we need from
`twenty-front-component-renderer`) — see `src/vendor/twenty/NOTICE.md` and `LICENSE-AGPL-3.0`.

| Feature | Upstream source |
|---|---|
| Bar / line / pie / aggregate chart widgets, tooltips, legends, drill-down click handling | `page-layout/widgets/graph/**` |
| Graph widget configuration model (metric, grouping, granularity, order, layout, cumulative…) | same, `generated-metadata` types |
| Record aggregates (count, sum, avg, min, max, % empty, unique…) | `object-record/record-aggregate`, `useAggregateRecords` |
| Filters (operands, values → query filters), drill-down URL format | `twenty-shared/utils/filter`, `graph/utils/buildChartDrilldownQueryParams` |
| Iframe widget | `page-layout/widgets/iframe` |

Only mechanical edits: `twenty-shared`'s internal `@/…` aliases became relative imports.
Five `@license Enterprise`-headed files are included (type-only `RowLevelPermission*` files pulled in through the
`twenty-shared/types` barrel; erased at build time, no runtime code). The project owner has accepted Twenty's AGPL-3.0 terms.

## What is ours (thin glue — `src/vendor/twenty-adapter`, `src/components/dashboard-builder`)
- `apolloLink.ts` / `chartData.ts`: an Apollo link that answers Twenty's `BarChartData`, `LineChartData`, `PieChartData`
  and `Aggregate<Plural>` operations from Supabase (`dashboard_aggregate` RPC). Twenty's server-side logic for these
  isn't in its frontend repo, so this part is a re-implementation of the response shaping.
- `metadata.ts`: object/field catalog for `contacts`, `deals`, `companies` in Twenty's metadata shape.
- `TwentyWidgetHost.tsx`: providers the vendored widgets expect (Jotai store, Lingui, Apollo, theme).
- Builder UI: grid (`react-grid-layout`, the library Twenty uses), widget gallery, settings panel, saved layouts
  (user/team), record context, approved embeds, drill-down page (`/objects/:plural`), record-list widget.

## Deliberately not vendored
- Twenty's **layout editor** (`page-layout/components`, ~4,850 files with the rest of Twenty's app) and the
  **record-table widget** (~2,500 files): replaced by our own grid shell and a simple record list. Everything else above is upstream.

## Supabase
Apply `supabase/migrations/20261111000000_dashboard_builder.sql`: `dashboard_layouts` (per user/team), `saved_filters`,
and SECURITY INVOKER functions `dashboard_aggregate`, `dashboard_records`, `dashboard_filter_sql` (whitelisted tables,
validated identifiers, no dynamic SQL from user input). As with the rest of the app, policies are open until the
tenant-token auth model is added.

## Build notes
Vendored code needs Linaria (`@wyw-in-js/vite`), Lingui macros (`@lingui/babel-plugin-lingui-macro`, `lingui.config.js`)
and the `@/`, `~/`, `twenty-shared/*` aliases — all wired in `vite.config.ts`. The builder is lazy-loaded so the main bundle is unaffected.
`npm run typecheck` reports (and ignores) type diagnostics located inside the vendored folder.

## Tests
`npm test` (resolvers, filters, model, rendering of all five widget types in jsdom) and `e2e/builder.e2e.cjs` (real
browser: charts, drag/resize, persistence, filters, context, drill-down, embeds, team scope).
