'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { chatController } from '@/controllers/chatController';
import { Chat } from '@/types/chat';
import Link from 'next/link';
import { UserResponse } from '@/types/user';

const ChatsPage = () => {
  const { accessToken, user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [counterpart, setCounterpart] = useState<UserResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const res = await chatController.getChats(accessToken!);
        setChats(res.data ?? []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar chats');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      loadChats();
    }
  }, [accessToken]);

  const getCounterpart = (chat: Chat) => {
    if (!user?.ci) return chat.participant1 || chat.participant2 || null;
    return chat.participant1?.ci === user.ci ? (chat.participant2 || null) : (chat.participant1 || null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border-4 border-surface-dark-70">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-secondary-color-70 mb-2">
              Tus chats
            </h1>
            <p className="text-gray-600">
              Lista de conversaciones
            </p>
          </div>

          {error && (
            <div className="px-6 py-4">
              <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No tienes chats aún.
              </div>
            ) : (
              chats.map((chat) => {
                const counterpart = getCounterpart(chat);
                return (
                  <div key={chat.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {counterpart?.name ? counterpart.name.slice(0, 2).toUpperCase() : '??'}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">{counterpart?.name}</div>
                      </div>

                    </div>
                    <div>
                      <Link href={`/chats/${chat.id}`} className="text-primary-color-80 hover:text-primary-color-90 font-medium">
                        Ver mensajes →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
