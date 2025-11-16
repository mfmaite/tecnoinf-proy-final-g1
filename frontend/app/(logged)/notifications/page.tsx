'use client';
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth';
import { notificationController } from '@/controllers/notificationController';
import type { NotificationDto } from '@/types/notification';
import { NotificationItem } from '@/components/notification/notification-item';

const NotificationsPage = () => {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await notificationController.getNotifications(accessToken!);
        if (res.success) {
          setNotifications(res.data ?? []);
        } else {
          setError(res.message ?? 'Error al obtener notificaciones');
        }
      } catch (error) {
        setError((error as any).message ?? 'Error al obtener notificaciones');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      loadNotifications();
    }
  }, [accessToken]);

  const handleMarkAsRead = async (id: string) => {
    if (!accessToken) return;
    const res = await notificationController.markAsRead(id, accessToken);
    if (res.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando notificaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border-4 border-surface-dark-70">

          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-secondary-color-70 mb-2">
              Lista de Notificaciones
            </h1>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-8 text-sm text-gray-600">
                No hay notificaciones por ahora.
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  markAsRead={async (id) => handleMarkAsRead(id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
