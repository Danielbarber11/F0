import React, { useState } from 'react';
import { signIn } from '../services/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
      <h2>התחבר</h2>
      <input placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="סיסמה" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'טוען...' : 'התחבר'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}