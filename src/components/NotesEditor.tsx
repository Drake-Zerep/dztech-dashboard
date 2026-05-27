'use client';
import { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

export default function NotesEditor() {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const res = await fetch('/api/sheets.php?action=get_notes');
        const data = await res.json();
        if (data.values && data.values[0]) {
          setNote(data.values[0][0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadNote();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    setSaved(false);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveNote(val), 1500);
  };

  const saveNote = async (text: string) => {
    setSaving(true);
    try {
      await fetch('/api/sheets.php?action=update_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-mono text-muted mb-4 tracking-widest uppercase">Quick Notes</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          {saving ? <span className="animate-pulse">Guardando...</span> : 
           saved ? <span className="text-primary flex items-center gap-1"><Save size={10} /> Synced</span> : null}
        </div>
      </div>
      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Escribe tus ideas aquí..."
        className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed font-mono text-gray-300 placeholder-gray-600 focus:ring-0"
        spellCheck={false}
      />
    </div>
  );
}
