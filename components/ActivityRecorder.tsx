import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function ActivityRecorder({ session }: { session: any }) {
  const userId = session?.user?.id || null;
  const [text, setText] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchActivities();

    const subscription = supabase
      .channel('public:activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, (payload) => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function fetchActivities() {
    const { data } = await supabase.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    setActivities(data || []);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text) return;
    await supabase.from('activities').insert([{ user_id: userId, type: 'note', payload: { text } }]);
    setText('');
    fetchActivities();
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>היסטוריית פעולות</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, maxWidth: 600 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="כתוב פעולה שתשמר" style={{ flex: 1 }} />
        <button type="submit">הוסף</button>
      </form>

      <ul>
        {activities.map((a) => (
          <li key={a.id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>
            <strong>{a.type}</strong> — {JSON.stringify(a.payload)} <small>({new Date(a.created_at).toLocaleString()})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}