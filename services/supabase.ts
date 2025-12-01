import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export let supabase: any = null;
export let usingSupabase = false;

if (supabaseUrl && supabaseAnonKey) {
  usingSupabase = true;
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase env not set — running in local fallback mode.');

  const listeners = new Set<{ cb: Function }>();
  const DB_KEY = 'F0_local_db_v1';
  function loadDb() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function saveDb(db: any) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {}
  }

  const localClient = {
    auth: {
      getSession: async () => ({ data: { session: JSON.parse(localStorage.getItem('F0_session') || 'null') } }),
      onAuthStateChange: (cb: any) => {
        const entry = { cb };
        listeners.add(entry);
        return { data: null, subscription: { unsubscribe: () => listeners.delete(entry) } };
      },
      signOut: async () => {
        localStorage.removeItem('F0_session');
        listeners.forEach(l => l.cb('SIGNED_OUT', null));
        return { error: null };
      },
    },
    from: (tableName: string) => ({
      select: async (_cols?: any) => {
        const db = loadDb();
        return { data: db[tableName] || [], error: null };
      },
      insert: async (rows: any[]) => {
        const db = loadDb();
        db[tableName] = db[tableName] || [];
        rows.forEach(r => {
          const item = { ...r, id: r.id ?? Date.now().toString() + Math.floor(Math.random() * 1000) };
          db[tableName].push(item);
        });
        saveDb(db);
        listeners.forEach(l => l.cb({ table: tableName, action: 'INSERT' }));
        return { data: rows, error: null };
      },
      upsert: async (row: any) => {
        const db = loadDb();
        db[tableName] = db[tableName] || [];
        const idx = db[tableName].findIndex((x: any) => x.id === row.id);
        if (idx >= 0) db[tableName][idx] = { ...db[tableName][idx], ...row };
        else db[tableName].push(row);
        saveDb(db);
        return { data: row, error: null };
      },
      order: () => ({
        limit: () => ({ eq: async () => ({ data: [], error: null }) })
      })
    }),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: { message: 'Local mode: upload not implemented' } }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
        download: async () => ({ data: null, error: { message: 'Local mode: download not implemented' } })
      })
    }
  };

  supabase = localClient;
}

export default supabase;
