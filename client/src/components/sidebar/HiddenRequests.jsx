import { useState } from 'react';
import { acceptMessageRequest, deleteMessageRequest } from '../../services/api.js';

export default function HiddenRequests({ requests = [], setRequests, open = false, onToggle, onOpenConversation }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      const res = await acceptMessageRequest(id);
      const conversation = res.data?.data;
      if (conversation && onOpenConversation) {
        onOpenConversation(conversation);
      }
      setRequests((prev) => prev.filter((r) => {
        const requestId = r._id?.toString?.() || r.id?.toString?.();
        return requestId !== id?.toString?.();
      }));
    } catch (err) {
      console.error('Failed to accept request', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMessageRequest(id);
      setRequests((prev) => prev.filter((r) => {
        const requestId = r._id?.toString?.() || r.id?.toString?.();
        return requestId !== id?.toString?.();
      }));
    } catch (err) {
      console.error('Failed to delete request', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '8px 12px', borderRadius: 12, background: requests.length > 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
      <div
        onClick={requests.length > 0 ? onToggle : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(148,163,184,0.8)',
          marginBottom: open ? 8 : 0,
          cursor: requests.length > 0 ? 'pointer' : 'default',
        }}
      >
        <span>Hidden Requests</span>
        {requests.length > 0 && (
          <span style={{ color: '#22d3ee' }}>{open ? 'Hide' : `${requests.length} new`}</span>
        )}
      </div>

      {loading && <div style={{ color: 'rgba(100,116,139,0.7)' }}>Loading...</div>}
      {!loading && open && requests.length === 0 && (
        <div style={{ color: 'rgba(100,116,139,0.6)', fontSize: 13 }}>No requests</div>
      )}
      {!loading && open && requests.map((r) => (
        <div key={r._id || r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.fromName || 'Unknown'}</div>
            <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.9)' }}>{r.text}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleAccept(r._id || r.id)} style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(34,211,238,0.12)', border: 'none', color: '#22d3ee' }}>Accept</button>
            <button onClick={() => handleDelete(r._id || r.id)} style={{ padding: '6px 8px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.9)' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
