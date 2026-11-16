# Third-party code

## `src/vendor/twenty/` — Twenty (twentyhq/twenty)
Front-end modules copied from the open-source Twenty CRM (https://github.com/twentyhq/twenty), packages
`twenty-front`, `twenty-shared` and a small `front-component-renderer` stub, used unmodified for the dashboard builder
(page-layout widgets, graph widgets, drag-and-drop list cells, record filters). Twenty is licensed under AGPL-3.0; the
license text is in `src/vendor/twenty/LICENSE-AGPL-3.0`. The project owner has confirmed the license terms are acceptable
for this application. Keep this notice and the license file when redistributing.

Only glue code lives outside that folder: `src/vendor/twenty-adapter/` (Apollo link that answers Twenty's widget queries
from Supabase, theme/provider wiring, tests) and `src/components/dashboard-builder/`, `src/components/movable/`.

## Dependencies
Runtime dependencies are listed in `package.json` and keep their own licenses (notably `@dnd-kit/*`, `react-grid-layout`,
`@nivo/*`, `@apollo/client`, `jotai`, `@lingui/*`, `@linaria/*`).
