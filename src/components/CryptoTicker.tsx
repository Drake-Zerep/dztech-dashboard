'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Necesitas instalar lucide-react: npm i lucide-react

const ASSETS = ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX', 'TON', 'SUI', 'XRP', 'ZEC', 'BNB'];

interface TickerData {
  symbol: string;
  price: string;
  change24h: number;
}

export default function CryptoTicker() {
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llamada a nuestro proxy PHP
        const res = await fetch('/api/crypto.php');
        const json = await res.json();
        
        // Mapeamos solo los activos que nos interesan
        const filtered = ASSETS.map(symbol => {
          const item = json.result.list.find((i: any) => i.symbol === `${symbol}USDT`);
          return {
            symbol: symbol,
            price: item ? parseFloat(item.lastPrice).toFixed(item.lastPrice.length > 4 ? 4 : 2) : '0.00',
            change24h: item ? parseFloat(item.price24hPcnt) * 100 : 0
          };
        });
        setData(filtered);
      } catch (e) {
        console.error("Error cargando crypto", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-2xl p-4 h-full overflow-hidden relative group">
      <h3 className="text-xs font-mono text-muted mb-4 tracking-widest uppercase">Mercado Live</h3>
      
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-white/5 rounded w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.symbol} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
              <span className="font-bold text-sm">{item.symbol}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">${item.price}</span>
                <span className={`flex items-center text-xs ${item.change24h >= 0 ? 'text-primary' : 'text-accent'}`}>
                  {item.change24h >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(item.change24h).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Glow effect decorativo */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
