'use client';
import { useState, useEffect } from 'react';
import { Plus, ExternalLink } from 'lucide-react';

export default function LinkCollector() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await fetch('/api/sheets.php?action=get_links');
      const data = await res.json();
      // Asume lista plana en columna A
      setLinks(data.values ? data.values.flat() : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Optimistic UI update
    setLinks(prev => [url, ...prev]);
    setUrl('');

    try {
      await fetch('/api/sheets.php?action=add_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="glass-card rounded-2xl p-4 h-full flex flex-col">
      <h3 className="text-xs font-mono text-muted mb-4 tracking-widest uppercase">Links Hub</h3>
      
      <form onSubmit={addLink} className="flex gap-2 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary transition-colors"
        />
        <button type="submit" className="bg-primary text-black p-2 rounded-lg hover:bg-cyan-300 transition-colors">
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {loading ? <div className="text-xs text-muted">Cargando...</div> :
         links.map((link, i) => (
          <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-xs text-gray-400 hover:text-primary group">
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="truncate">{link}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
