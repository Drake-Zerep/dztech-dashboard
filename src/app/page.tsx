import CryptoTicker from '@/components/CryptoTicker';
import NotesEditor from '@/components/NotesEditor';
import LinkCollector from '@/components/LinkCollector';
import CalendarWidget from '@/components/CalendarWidget';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          DZTech Dashboard
        </h1>
        <div className="text-xs text-muted font-mono">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        
        {/* Notas (Grande) */}
        <div className="md:col-span-2 row-span-2">
          <NotesEditor />
        </div>

        {/* Crypto (Alto) */}
        <div className="md:col-span-1 row-span-2">
          <CryptoTicker />
        </div>

        {/* Links (Pequeño) */}
        <div className="md:col-span-1 row-span-1">
           <LinkCollector />
        </div>

        {/* Calendar (Ancho completo en movil, 2 cols en desktop) */}
        <div className="md:col-span-2 lg:col-span-2 row-span-1">
          <CalendarWidget />
        </div>

      </div>
    </main>
  );
}
