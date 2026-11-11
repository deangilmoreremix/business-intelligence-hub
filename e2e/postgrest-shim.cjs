// Minimal PostgREST-compatible shim over real Postgres (for local E2E only).
const http = require('http');
const { Pool } = require('pg');
const pool = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'pw', database: 'biztest' });
let reqHeaders = '{}';
const q = async (sql, params) => {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE anon');
    await c.query("select set_config('request.headers', $1, true)", [reqHeaders]);
    const r = await c.query(sql, params);
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
};
const id = s => '"' + s.replace(/"/g, '""') + '"';
const types = {};
const colType = async (table, col) => {
  if (!types[table]) {
    const r = await pool.query("select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1", [table]);
    types[table] = Object.fromEntries(r.rows.map(x => [x.column_name, x.data_type]));
  }
  return types[table][col];
};
const jsonify = (v, type) => (v !== null && typeof v === 'object' && (!Array.isArray(v) || type === 'jsonb' || type === 'json') ? JSON.stringify(v) : v);

function where(params, vals) {
  const parts = [];
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    const m = /^(eq|neq|in|is|gte|lte|gt|lt|like|ilike)\.(.*)$/.exec(v);
    if (!m) continue;
    const [, op, val] = m;
    if (op === 'in') {
      const arr = val.replace(/^\(|\)$/g, '').split(',').map(x => x.replace(/^"|"$/g, ''));
      vals.push(arr);
      parts.push(`${id(k)} = ANY($${vals.length})`);
    } else if (op === 'is') {
      parts.push(`${id(k)} IS ${val === 'null' ? 'NULL' : val.toUpperCase()}`);
    } else {
      const sym = { eq: '=', neq: '<>', gte: '>=', lte: '<=', gt: '>', lt: '<', like: 'LIKE', ilike: 'ILIKE' }[op];
      vals.push(val);
      parts.push(`${id(k)} ${sym} $${vals.length}`);
    }
  }
  return parts.length ? ' WHERE ' + parts.join(' AND ') : '';
}

http
  .createServer(async (req, res) => {
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-expose-headers': '*',
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      return res.end();
    }
    reqHeaders = JSON.stringify(req.headers);
    const url = new URL(req.url, 'http://x');
    const m = /^\/rest\/v1\/([a-z_]+)$/.exec(url.pathname);
    const rawChunks = [];
    for await (const c of req) rawChunks.push(c);
    const rawBody = Buffer.concat(rawChunks);
    const body = rawBody.toString('utf8');
    const send = (code, obj) => {
      res.writeHead(code, { ...cors, 'content-type': 'application/json' });
      res.end(obj === undefined ? '' : JSON.stringify(obj));
    };
    // ---- Supabase Storage stand-in (people-images bucket) ----
    const store = require('fs'); const pth = require('path');
    const STORE_DIR = pth.join(__dirname, 'storage-data');
    const signM = /^\/storage\/v1\/object\/upload\/sign\/([^/]+)\/(.+)$/.exec(url.pathname);
    const pubM = /^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url.pathname);
    if (signM && req.method === 'POST') {
      res.writeHead(200, { ...cors, 'content-type': 'application/json' });
      return res.end(JSON.stringify({ url: `/object/upload/sign/${signM[1]}/${signM[2]}?token=t_${Date.now()}` }));
    }
    if (signM && req.method === 'PUT') {
      const file = pth.join(STORE_DIR, signM[1], decodeURIComponent(signM[2]));
      store.mkdirSync(pth.dirname(file), { recursive: true });
      store.writeFileSync(file, rawBody);
      store.writeFileSync(file + '.type', req.headers['content-type'] || 'application/octet-stream');
      res.writeHead(200, { ...cors, 'content-type': 'application/json' });
      return res.end(JSON.stringify({ Key: `${signM[1]}/${signM[2]}` }));
    }
    if (pubM && (req.method === 'GET' || req.method === 'HEAD')) {
      const file = pth.join(STORE_DIR, pubM[1], decodeURIComponent(pubM[2]));
      if (!store.existsSync(file)) { res.writeHead(404, cors); return res.end(); }
      res.writeHead(200, { ...cors, 'content-type': store.readFileSync(file + '.type', 'utf8') });
      return res.end(store.readFileSync(file));
    }
    const rpcMatch = /^\/rest\/v1\/rpc\/([a-z_]+)$/.exec(url.pathname);
    if (rpcMatch && req.method === 'POST') {
      try {
        const args = JSON.parse(body || '{}');
        const names = Object.keys(args);
        const vals = names.map(k => (args[k] !== null && typeof args[k] === 'object' ? JSON.stringify(args[k]) : args[k]));
        const fn = rpcMatch[1];
        const r = await q(`SELECT * FROM ${id(fn)}(${names.map((n, i) => `${id(n)} := $${i + 1}`).join(', ')})`, vals);
        const single = r.fields.length === 1 && r.fields[0].name === fn;
        return send(200, single ? r.rows.map(x => x[fn]) : r.rows);
      } catch (e) { return send(400, { code: e.code, message: e.message }); }
    }
    if (!m) return send(404, { message: 'not found' });
    const t = id(m[1]);
    const params = [...url.searchParams.entries()];
    const prefer = req.headers.prefer || '';
    const wantRep = /return=representation/.test(prefer);
    const single = /vnd.pgrst.object/.test(req.headers.accept || '');
    try {
      let r;
      if (req.method === 'GET' || req.method === 'HEAD') {
        const vals = [];
        let sql = `SELECT * FROM ${t}${where(params, vals)}`;
        const ord = url.searchParams.get('order');
        if (ord) {
          sql += ' ORDER BY ' + ord.split(',').map(o => {
            const [c, d] = o.split('.');
            return `${id(c)} ${d === 'desc' ? 'DESC' : 'ASC'}`;
          }).join(',');
        }
        if (url.searchParams.get('limit')) sql += ' LIMIT ' + parseInt(url.searchParams.get('limit'), 10);
        r = await q(sql, vals);
      } else if (req.method === 'POST') {
        const rows = [].concat(JSON.parse(body));
        const cols = [...new Set(rows.flatMap(Object.keys))];
        const vals = [];
        const ct = {};
        for (const c of cols) ct[c] = await colType(m[1], c);
        const tuples = rows.map(row => '(' + cols.map(c => {
          vals.push(jsonify(row[c] ?? null, ct[c]));
          return `$${vals.length}`;
        }).join(',') + ')');
        let sql = `INSERT INTO ${t} (${cols.map(id).join(',')}) VALUES ${tuples.join(',')}`;
        if (/resolution=merge-duplicates/.test(prefer)) {
          const oc = (url.searchParams.get('on_conflict') || 'id').split(',');
          sql += ` ON CONFLICT (${oc.map(id).join(',')}) DO UPDATE SET ${cols.map(c => `${id(c)}=EXCLUDED.${id(c)}`).join(',')}`;
        }
        r = await q(sql + ' RETURNING *', vals);
      } else if (req.method === 'PATCH') {
        const patch = JSON.parse(body);
        const vals = [];
        const ct = {};
        for (const k of Object.keys(patch)) ct[k] = await colType(m[1], k);
        const sets = Object.entries(patch).map(([k, v]) => {
          vals.push(jsonify(v, ct[k]));
          return `${id(k)}=$${vals.length}`;
        });
        r = await q(`UPDATE ${t} SET ${sets.join(',')}${where(params, vals)} RETURNING *`, vals);
      } else if (req.method === 'DELETE') {
        const vals = [];
        r = await q(`DELETE FROM ${t}${where(params, vals)} RETURNING *`, vals);
      }
      if (single) {
        if (r.rows.length !== 1) {
          return send(406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `Results contain ${r.rows.length} rows` });
        }
        return send(200, r.rows[0]);
      }
      if (req.method === 'GET') return send(200, r.rows);
      return wantRep ? send(req.method === 'POST' ? 201 : 200, r.rows) : send(req.method === 'POST' ? 201 : 204, undefined);
    } catch (e) {
      send(400, { code: e.code, message: e.message });
    }
  })
  .listen(54321, () => console.log('rest up'));
