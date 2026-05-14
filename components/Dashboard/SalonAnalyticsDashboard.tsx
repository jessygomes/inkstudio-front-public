'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ViewStats {
  totalViews: number;
  uniqueVisitors: number;
  averageViewsPerDay: number;
  viewsByDay: Record<string, number>;
  viewsByDeviceType: Record<string, number>;
  viewsByReferrer: Record<string, number>;
  viewsByCountry: Record<string, number>;
  viewsByCity: Record<string, number>;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  lastUpdated: string;
}

interface SalonAnalyticsDashboardProps {
  salonId: string;
  days?: number;
}

export function SalonAnalyticsDashboard({
  salonId,
  days = 30,
}: SalonAnalyticsDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/salon-analytics/${salonId}/stats?days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${(session as any).accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load statistics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [salonId, days, session]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full mx-auto" />
        <p className="text-white/60 mt-4">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
        Erreur: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm font-one">Visites totales</p>
          <p className="text-4xl font-one text-white mt-2">{stats.totalViews}</p>
          <p className="text-white/50 text-xs mt-2">
            Derniers {stats.period.days} jours
          </p>
        </div>

        <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm font-one">Visiteurs uniques</p>
          <p className="text-4xl font-one text-white mt-2">
            {stats.uniqueVisitors}
          </p>
          <p className="text-white/50 text-xs mt-2">
            ~{Math.round(stats.averageViewsPerDay)} par jour
          </p>
        </div>

        <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm font-one">
            Taux de conversion apparent
          </p>
          <p className="text-4xl font-one text-white mt-2">
            {stats.uniqueVisitors > 0
              ? Math.round((stats.totalViews / stats.uniqueVisitors) * 100)
              : 0}
            %
          </p>
          <p className="text-white/50 text-xs mt-2">
            Vues par visiteur unique
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par type d'appareil */}
        {Object.keys(stats.viewsByDeviceType).length > 0 && (
          <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-one text-sm mb-4 uppercase tracking-wider">
              Par type d'appareil
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.viewsByDeviceType)
                .sort((a, b) => b[1] - a[1])
                .map(([device, count]) => {
                  const percentage =
                    (count / stats.totalViews) * 100 || 0;
                  return (
                    <div key={device}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/80 text-sm">
                          {device}
                        </span>
                        <span className="text-white/60 text-xs">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-noir-700/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 h-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Par source */}
        {Object.keys(stats.viewsByReferrer).length > 0 && (
          <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-one text-sm mb-4 uppercase tracking-wider">
              Par source
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.viewsByReferrer)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([referrer, count]) => {
                  const percentage =
                    (count / stats.totalViews) * 100 || 0;
                  const displayReferrer = referrer
                    .substring(0, 40)
                    .replace('https://', '')
                    .replace('http://', '');

                  return (
                    <div key={referrer}>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className="text-white/80 text-sm truncate"
                          title={referrer}
                        >
                          {displayReferrer}
                        </span>
                        <span className="text-white/60 text-xs">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-noir-700/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-500 h-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Localisation */}
      {(Object.keys(stats.viewsByCountry).length > 0 ||
        Object.keys(stats.viewsByCity).length > 0) && (
        <div className="bg-gradient-to-br from-noir-600 to-noir-700 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-one text-sm mb-4 uppercase tracking-wider">
            Localisation
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {Object.keys(stats.viewsByCountry).length > 0 && (
              <div>
                <p className="text-white/60 text-xs mb-3">Pays</p>
                <div className="space-y-2">
                  {Object.entries(stats.viewsByCountry)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div
                        key={country}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-white/80">{country}</span>
                        <span className="text-white/60">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(stats.viewsByCity).length > 0 && (
              <div>
                <p className="text-white/60 text-xs mb-3">Villes</p>
                <div className="space-y-2">
                  {Object.entries(stats.viewsByCity)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([city, count]) => (
                      <div
                        key={city}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-white/80">{city}</span>
                        <span className="text-white/60">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last updated */}
      <p className="text-white/40 text-xs text-center">
        Dernière mise à jour:{' '}
        {new Date(stats.lastUpdated).toLocaleString('fr-FR')}
      </p>
    </div>
  );
}
