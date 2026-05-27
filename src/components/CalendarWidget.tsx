'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Clock, ExternalLink } from 'lucide-react';

interface EventItem {
  summary: string;
  start: { dateTime?: string; date?: string };
  htmlLink: string;
  id: string;
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ summary: '', dateTime: '' });

  // Cargar eventos
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar-proxy.php?action=list');
      const data = await res.json();
      if (data.items) {
        setEvents(data.items.filter((e: any) => e.status !== 'cancelled'));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.summary || !newEvent.dateTime) return;

    try {
      await fetch('/api/calendar-proxy.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      setShowForm(false);
      setNewEvent({ summary: '', dateTime: '' });
      fetchEvents(); // Recargar lista
    } catch (err) { console.error(err); }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return {
      day: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="glass-card rounded-2xl p-4 h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10">
        <h3 className="text-xs font-mono text-muted tracking-widest uppercase flex items-center gap-2">
          <Calendar size={14} className="text-secondary" /> Agenda
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-8 h-8 rounded-full bg-secondary/20 hover:bg-secondary text-secondary hover:text-white flex items-center justify-center transition-all"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Formulario de Añadir */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10 z-10"
          >
            <input
              type="text"
              placeholder="Título del evento"
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none mb-2"
              value={newEvent.summary}
              onChange={(e) => setNewEvent({...newEvent, summary: e.target.value})}
            />
            <input
              type="datetime-local"
              className="w-full bg-black/20 text-xs text-gray-300 p-2 rounded border border-white/10 outline-none mb-2"
              value={newEvent.dateTime}
              onChange={(e) => setNewEvent({...newEvent, dateTime: e.target.value})}
            />
            <button type="submit" className="w-full bg-secondary text-white text-xs py-2 rounded hover:opacity-80 transition-opacity">
              Guardar Evento
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de Eventos */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 z-10">
        {loading ? (
          <div className="animate-pulse space-y-3">
             <div className="h-10 bg-white/5 rounded w-full" />
             <div className="h-10 bg-white/5 rounded w-3/4" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted text-xs py-10">Sin eventos próximos</div>
        ) : (
          events.slice(0, 6).map((evt) => {
            const { day, time } = formatDate(evt.start.dateTime || evt.start.date || '');
            return (
              <a 
                key={evt.id} 
                href={evt.htmlLink} 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-primary font-mono text-[10px]">
                  <span className="uppercase">{day.split(' ')[0]}</span>
                  <span className="text-sm text-white">{day.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate font-medium">{evt.summary}</p>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <Clock size={10} /> {time}
                  </p>
                </div>
                <ExternalLink size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })
        )}
      </div>
      
      {/* Decoración de fondo */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />
    </div>
  );
}
