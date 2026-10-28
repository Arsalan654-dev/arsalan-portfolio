'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ChatbotPage() {
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadInstructions(); }, []);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const res = await adminService.chatbot.getInstructions();
      const data = res.data?.data || res.data;
      setInstructions(data?.instructions || data?.body || '');
    } catch {
      toast.error('Failed to load chatbot instructions');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.chatbot.updateInstructions({ instructions });
      toast.success('Instructions saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const inputStyle = { background: 'var(--bs)', color: 'var(--tp)', borderColor: 'var(--bdr)', borderRadius: '8px' };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--tp)' }}>Chatbot Instructions</h4>
      <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bs)' }}>
        <p className="mb-3" style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>
          Define how the chatbot should respond to users. These instructions guide the bots behavior and knowledge.
        </p>
        <textarea
          className="form-control"
          rows={15}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter chatbot instructions here..."
          style={inputStyle}
        />
        <div className="mt-3 d-flex justify-content-end">
          <button onClick={handleSave} disabled={saving} className="btn px-4"
            style={{ background: 'var(--gm)', color: '#fff', border: 'none' }}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Instructions'}
          </button>
        </div>
      </div>
    </div>
  );
}
