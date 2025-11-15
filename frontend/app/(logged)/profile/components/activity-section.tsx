import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/button/button';
import { userController } from '@/controllers/userController';
import { UserActivity } from '@/types/activity';

interface ActivitySectionProps {
  accessToken: string | null | undefined;
}

export function ActivitySection({ accessToken }: ActivitySectionProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialDates = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const toYmd = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: toYmd(start), endDate: toYmd(end) };
  }, []);

  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);

  const typeLabel: Record<UserActivity['type'], string> = {
    FORUM_PARTICIPATION: 'Participación en foros',
    ACTIVITY_SENT: 'Entrega de evaluación',
  };

  const fetchActivities = async (opts?: { start?: string; end?: string }) => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    const { start, end } = opts || {};
    const res = await userController.getUserActivities(accessToken, {
      startDate: start ?? startDate,
      endDate: end ?? endDate,
    });
    if (res.success && res.data) {
      setActivities(res.data);
    } else {
      setError(res.message ?? 'No se pudieron obtener las actividades');
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            max={endDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-text-neutral-50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-text-neutral-50"
          />
        </div>
        <div className="sm:ml-auto">
          <Button onClick={() => fetchActivities()} disabled={loading}>
            {loading ? 'Cargando...' : 'Filtrar'}
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enlace</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {error && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-red-600">{error}</td>
              </tr>
            )}
            {!error && activities.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-gray-500">Sin actividad en el período seleccionado.</td>
              </tr>
            )}
            {!error && activities.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm text-secondary-color-70">
                  {new Date(a.createdDate).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-secondary-color-70">
                  {typeLabel[a.type]}
                </td>
                <td className="px-4 py-3 text-sm text-secondary-color-70">
                  {a.description ?? '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <a href={a.link} className="text-primary-color-60 hover:underline break-all">Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


