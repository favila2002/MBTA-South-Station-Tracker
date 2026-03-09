import React, { useEffect, useState } from 'react';
import { fetchSouthStationDepartures } from './api.js';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function StatusBadge({ status }) {
  let colorClasses = 'bg-gray-700 text-gray-100';

  const normalized = (status || '').toLowerCase();
  if (normalized.includes('late') || normalized.includes('delayed')) {
    colorClasses = 'bg-red-800 text-red-100';
  } else if (normalized.includes('boarding') || normalized.includes('on time')) {
    colorClasses = 'bg-mbtaPurple text-white';
  } else if (normalized.includes('cancel')) {
    colorClasses = 'bg-gray-700 text-gray-300 line-through';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colorClasses}`}>
      {status || '—'}
    </span>
  );
}

function App() {
  const [now, setNow] = useState(new Date());
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSouthStationDepartures();
        if (isMounted) {
          setDepartures(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load departures');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = setInterval(load, 30_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-100 tracking-tight">
              MBTA South Station Departures
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Live commuter rail departures powered by the MBTA v3 API.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono text-mbtaPurple-light">
              {formatTime(now)}
            </div>
            <div className="text-sm text-gray-400">
              {formatDate(now)}
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <section className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-100">
                Upcoming Departures (South Station)
              </h2>
              <span className="text-xs text-gray-500">
                Updated every 30 seconds
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            {loading && !departures.length ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-mbtaPurple border-t-transparent" />
                  <p className="text-sm text-gray-400">Loading departures…</p>
                </div>
              </div>
            ) : departures.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-gray-400">
                  No upcoming departures found for South Station.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950/60">
                <div className="max-h-[70vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Departure
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Destination
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Track
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-950/40">
                      {departures.map((dep) => (
                        <tr key={dep.id} className="hover:bg-gray-900/70 transition-colors">
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-100 font-mono">
                            {formatTime(dep.departureTime)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-200">
                            {dep.destination}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <span className="inline-flex items-center justify-center rounded-md border border-mbtaPurple-dark bg-gray-900 px-3 py-1 text-xs font-medium text-mbtaPurple-light">
                              {dep.track}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <StatusBadge status={dep.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          <section className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-100">
                South Station Location
              </h2>
              <span className="text-xs text-gray-500">
              
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950/60">
              <div className="h-72 w-full">
                <iframe
                  title="South Station Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-71.0585,42.3500,-71.0515,42.3545&layer=mapnik&marker=42.352271,-71.055242"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-center text-xs text-gray-500">
          Created by Felipe Avila ·{' '}
          <a
            href="https://github.com/favila2002/MBTA-South-Station-Tracker"
            className="text-mbtaPurple-light hover:text-mbtaPurple underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;

