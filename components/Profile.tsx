import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function Profile({ session }: { session: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id || session?.user?.id || null;

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') {
        console.error(error);
      }
      if (mounted) setProfile(data);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value;

    const updates = {
      id: userId,
      username,
      full_name,
      avatar_url: profile?.avatar_url || null,
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      alert('שגיאה בעדכון הפרופיל: ' + error.message);
    } else {
      alert('הפרופיל נשמר');
      // reload
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('uploads').upload(filePath, file);
    if (error) return alert('Upload error: ' + error.message);
    const publicUrl = supabase.storage.from('uploads').getPublicUrl(filePath).data.publicUrl;
    const { error: upsertErr } = await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl });
    if (upsertErr) return alert('Error saving avatar url: ' + upsertErr.message);
    setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
  }

  if (!userId) return <div>טוען משתמש...</div>;
  if (loading) return <div>טוען פרופיל...</div>;

  return (
    <div style={{ marginTop: 20 }}>
      <h2>פרופיל</h2>
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <img src={profile?.avatar_url || 'https://via.placeholder.com/80'} alt="avatar" style={{ width: 80, height: 80, objectFit: 'cover' }} />
        <input name="username" defaultValue={profile?.username || ''} placeholder="שם משתמש" />
        <input name="full_name" defaultValue={profile?.full_name || ''} placeholder="שם מלא" />
        <input type="file" onChange={handleUpload} />
        <button type="submit">שמור פרופיל</button>
      </form>
    </div>
  );
}