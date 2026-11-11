/*
  Dashboard builder (Twenty page-layout widgets): saved layouts + aggregation RPC.

  - dashboard_layouts: one row per saved dashboard, scoped to a user or a team.
  - saved_filters: reusable record filters (Twenty RecordGqlOperationFilter JSON) usable by widgets.
  - dashboard_aggregate(): group/aggregate over a WHITELISTED set of tables. SECURITY INVOKER, so
    row level security of the underlying table applies. All identifiers go through %I / format.
  - dashboard_filter_sql(): translates Twenty's filter JSON ({and, or, not, field:{op:value}}) to SQL.

  NOTE: like the rest of the app, policies are open to anon/authenticated until an auth model
  (host-issued tenant token) is added; see the production-hardening plan.
*/

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My dashboard',
  scope text NOT NULL DEFAULT 'user' CHECK (scope IN ('user', 'team')),
  owner_id text NOT NULL DEFAULT 'anonymous',      -- user id (scope=user) or team id (scope=team)
  layout jsonb NOT NULL DEFAULT '{"widgets": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dashboard_layouts_owner_idx ON dashboard_layouts (scope, owner_id);

CREATE TABLE IF NOT EXISTS saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  object_name text NOT NULL CHECK (object_name IN ('contact', 'deal', 'company')),
  filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  scope text NOT NULL DEFAULT 'user' CHECK (scope IN ('user', 'team')),
  owner_id text NOT NULL DEFAULT 'anonymous',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dashboard_layouts_all" ON dashboard_layouts;
CREATE POLICY "dashboard_layouts_all" ON dashboard_layouts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "saved_filters_all" ON saved_filters;
CREATE POLICY "saved_filters_all" ON saved_filters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- camelCase (Twenty field name) -> snake_case column, validated against the real table.
CREATE OR REPLACE FUNCTION dashboard_column(p_table text, p_field text)
RETURNS text LANGUAGE plpgsql STABLE AS $$
DECLARE col text;
BEGIN
  IF p_table NOT IN ('contacts', 'deals', 'companies') THEN
    RAISE EXCEPTION 'table % is not allowed', p_table USING ERRCODE = '42501';
  END IF;
  col := lower(regexp_replace(p_field, '([A-Z])', '_\1', 'g'));
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = p_table AND column_name = col
  ) THEN
    RAISE EXCEPTION 'column % does not exist on %', p_field, p_table USING ERRCODE = '42703';
  END IF;
  RETURN col;
END $$;

CREATE OR REPLACE FUNCTION dashboard_filter_sql(p_table text, p_filter jsonb)
RETURNS text LANGUAGE plpgsql STABLE AS $$
DECLARE
  k text; v jsonb; parts text[] := '{}'; op text; ov jsonb; col text; item jsonb; sub text[];
BEGIN
  IF p_filter IS NULL OR jsonb_typeof(p_filter) <> 'object' OR p_filter = '{}'::jsonb THEN
    RETURN 'true';
  END IF;
  FOR k, v IN SELECT * FROM jsonb_each(p_filter) LOOP
    IF k IN ('and', 'or') THEN
      sub := '{}';
      FOR item IN SELECT * FROM jsonb_array_elements(v) LOOP
        sub := sub || dashboard_filter_sql(p_table, item);
      END LOOP;
      IF array_length(sub, 1) IS NULL THEN CONTINUE; END IF;
      parts := parts || ('(' || array_to_string(sub, CASE WHEN k = 'and' THEN ' AND ' ELSE ' OR ' END) || ')');
    ELSIF k = 'not' THEN
      parts := parts || ('NOT (' || dashboard_filter_sql(p_table, v) || ')');
    ELSE
      col := dashboard_column(p_table, k);
      FOR op, ov IN SELECT * FROM jsonb_each(v) LOOP
        parts := parts || CASE op
          WHEN 'eq' THEN format('%I = %L', col, ov #>> '{}')
          WHEN 'neq' THEN format('%I <> %L', col, ov #>> '{}')
          WHEN 'gt' THEN format('%I > %L', col, ov #>> '{}')
          WHEN 'gte' THEN format('%I >= %L', col, ov #>> '{}')
          WHEN 'lt' THEN format('%I < %L', col, ov #>> '{}')
          WHEN 'lte' THEN format('%I <= %L', col, ov #>> '{}')
          WHEN 'like' THEN format('%I::text LIKE %L', col, ov #>> '{}')
          WHEN 'ilike' THEN format('%I::text ILIKE %L', col, ov #>> '{}')
          WHEN 'in' THEN format('%I::text = ANY (%L::text[])', col,
            (SELECT '{' || string_agg('"' || replace(replace(x, '\', '\\'), '"', '\"') || '"', ',') || '}'
               FROM jsonb_array_elements_text(ov) x))
          WHEN 'is' THEN CASE WHEN upper(ov #>> '{}') = 'NULL' THEN format('%I IS NULL', col) ELSE format('%I IS NOT NULL', col) END
          ELSE (SELECT 'true' WHERE false)  -- unknown operator: rejected below
        END;
        IF parts[array_upper(parts, 1)] IS NULL THEN
          RAISE EXCEPTION 'unsupported filter operator %', op USING ERRCODE = '22023';
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  IF array_length(parts, 1) IS NULL THEN RETURN 'true'; END IF;
  RETURN '(' || array_to_string(parts, ' AND ') || ')';
END $$;

CREATE OR REPLACE FUNCTION dashboard_aggregate(
  p_table text,
  p_metric text,
  p_field text DEFAULT NULL,
  p_group1 text DEFAULT NULL,
  p_bucket1 text DEFAULT NULL,
  p_group2 text DEFAULT NULL,
  p_bucket2 text DEFAULT NULL,
  p_filter jsonb DEFAULT '{}'::jsonb,
  p_limit integer DEFAULT 200
)
RETURNS TABLE (g1 text, g2 text, v double precision)
LANGUAGE plpgsql STABLE SECURITY INVOKER AS $$
DECLARE
  fcol text; c1 text; c2 text; agg text; e1 text := 'NULL::text'; e2 text := 'NULL::text';
  sql text; dtype text;
  buckets constant text[] := ARRAY['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'];
BEGIN
  p_limit := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 1000);
  IF p_field IS NOT NULL THEN fcol := dashboard_column(p_table, p_field); END IF;

  IF p_metric NOT IN ('count', 'count_empty', 'count_not_empty', 'count_unique', 'percentage_empty',
                      'percentage_not_empty', 'count_true', 'count_false', 'sum', 'avg', 'min', 'max') THEN
    RAISE EXCEPTION 'unsupported metric %', p_metric USING ERRCODE = '22023';
  END IF;
  IF p_metric IN ('sum', 'avg', 'min', 'max') AND fcol IS NULL THEN
    RAISE EXCEPTION 'metric % needs a field', p_metric USING ERRCODE = '22023';
  END IF;

  IF p_metric IN ('sum', 'avg') THEN
    SELECT data_type INTO dtype FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = p_table AND column_name = fcol;
    IF dtype NOT IN ('integer', 'bigint', 'numeric', 'double precision', 'real', 'smallint') THEN
      RAISE EXCEPTION 'metric % requires a numeric field', p_metric USING ERRCODE = '22023';
    END IF;
  END IF;

  agg := CASE p_metric
    WHEN 'count' THEN 'count(*)::double precision'
    WHEN 'count_empty' THEN format('count(*) FILTER (WHERE %I IS NULL OR %I::text = '''')::double precision', fcol, fcol)
    WHEN 'count_not_empty' THEN format('count(*) FILTER (WHERE %I IS NOT NULL AND %I::text <> '''')::double precision', fcol, fcol)
    WHEN 'count_unique' THEN format('count(DISTINCT %I)::double precision', fcol)
    WHEN 'percentage_empty' THEN format('(100.0 * count(*) FILTER (WHERE %I IS NULL OR %I::text = '''') / NULLIF(count(*), 0))::double precision', fcol, fcol)
    WHEN 'percentage_not_empty' THEN format('(100.0 * count(*) FILTER (WHERE %I IS NOT NULL AND %I::text <> '''') / NULLIF(count(*), 0))::double precision', fcol, fcol)
    WHEN 'count_true' THEN format('count(*) FILTER (WHERE %I::text = ''true'')::double precision', fcol)
    WHEN 'count_false' THEN format('count(*) FILTER (WHERE %I::text = ''false'')::double precision', fcol)
    WHEN 'sum' THEN format('sum(%I)::double precision', fcol)
    WHEN 'avg' THEN format('avg(%I)::double precision', fcol)
    WHEN 'min' THEN format('min(%I)::double precision', fcol)
    WHEN 'max' THEN format('max(%I)::double precision', fcol)
  END;

  IF p_group1 IS NOT NULL THEN
    c1 := dashboard_column(p_table, p_group1);
    IF p_bucket1 IS NOT NULL AND upper(p_bucket1) = ANY (buckets) THEN
      e1 := format('to_char(date_trunc(%L, %I), ''YYYY-MM-DD'')', lower(p_bucket1), c1);
    ELSE
      e1 := format('%I::text', c1);
    END IF;
  END IF;
  IF p_group2 IS NOT NULL THEN
    c2 := dashboard_column(p_table, p_group2);
    IF p_bucket2 IS NOT NULL AND upper(p_bucket2) = ANY (buckets) THEN
      e2 := format('to_char(date_trunc(%L, %I), ''YYYY-MM-DD'')', lower(p_bucket2), c2);
    ELSE
      e2 := format('%I::text', c2);
    END IF;
  END IF;

  sql := format('SELECT %s AS g1, %s AS g2, %s AS v FROM public.%I WHERE %s',
                e1, e2, agg, p_table, dashboard_filter_sql(p_table, p_filter));
  IF p_group1 IS NOT NULL OR p_group2 IS NOT NULL THEN
    sql := sql || ' GROUP BY 1, 2 ORDER BY 1 NULLS FIRST, 2 NULLS FIRST';
  END IF;
  sql := sql || format(' LIMIT %s', p_limit);

  RETURN QUERY EXECUTE sql;
END $$;

GRANT EXECUTE ON FUNCTION dashboard_column(text, text), dashboard_filter_sql(text, jsonb),
  dashboard_aggregate(text, text, text, text, text, text, text, jsonb, integer) TO anon, authenticated;
