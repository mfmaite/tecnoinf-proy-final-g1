 'use client';

 import React, { useEffect, useMemo, useState } from 'react';
 import { useParams, useRouter, useSearchParams } from 'next/navigation';
 import { useAuth } from '@/hooks/useAuth';
 import { chatController } from '@/controllers/chatController';
 import { Message } from '@/types/message';
 import { Chat } from '@/types/chat';
 import { UserResponse } from '@/types/user';

 const getCounterpart = (chat: Chat, currentUser: UserResponse) => {
  if (!currentUser?.ci) return chat.participant1 || chat.participant2 || null;
  return chat.participant1?.ci === currentUser.ci ? (chat.participant2 || null) : (chat.participant1 || null);
};

 const ChatDetailPage = () => {
   const params = useParams<{ chatId: string }>();
   const searchParams = useSearchParams();
   const router = useRouter();
   const chatIdParam = params?.chatId;
   const chatId = useMemo(() => Number(chatIdParam), [chatIdParam]);
   const isNewChat = useMemo(() => Number.isNaN(chatId), [chatId]);
   const recipientCiFromParams = searchParams?.get('recipientCi') || '';
   const { accessToken, user } = useAuth();

   const [messages, setMessages] = useState<Message[]>([]);
   const [chats, setChats] = useState<Chat[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string>('');
   const [counterpart, setCounterpart] = useState<UserResponse | null>(null);
   const [text, setText] = useState<string>('');
   const [isSending, setIsSending] = useState(false);

   const counterpartCi = useMemo(() => {
     if (isNewChat) return recipientCiFromParams;
     const chat = chats.find(c => c.id === chatId);
     if (!chat) return '';
     if (!user?.ci) return chat.participant1?.ci || chat.participant2?.ci || '';
     return chat.participant1?.ci === user.ci ? (chat.participant2?.ci || '') : (chat.participant1?.ci || '');
   }, [chats, chatId, user?.ci, isNewChat, recipientCiFromParams]);

   useEffect(() => {
     const load = async () => {
       if (!accessToken) return;
       try {
         setIsLoading(true);
         // Always load chats list to compute counterpart and ensure context
         const chatsRes = await chatController.getChats(accessToken);
         setChats(chatsRes.data ?? []);

         // If this is a "new chat" but there are existing chats with this recipient,
         // redirect to one of them to avoid server-side non-unique chat errors
         if (isNewChat && (chatsRes.data?.length ?? 0) > 0 && recipientCiFromParams) {
           const matches = (chatsRes.data ?? []).filter(c =>
             c.participant1?.ci === recipientCiFromParams || c.participant2?.ci === recipientCiFromParams
           );
           if (matches.length > 0) {
             const targetId = matches.reduce((acc, c) => (c.id > acc ? c.id : acc), matches[0].id);
             router.replace(`/chats/${targetId}`);
             return;
           }
         }

         // If this is an existing chat, load its messages
         if (!isNewChat && Number.isFinite(chatId) && chatId > 0) {
           const msgsRes = await chatController.getMessages(chatId, accessToken);
           if (!msgsRes.success) throw new Error(msgsRes.message || 'Error al cargar mensajes');
           setMessages(msgsRes.data ?? []);
         } else {
           setMessages([]);
         }

         // Set counterpart for header if we have a matching chat
         if (chatsRes.data && user && !isNewChat) {
           const current = chatsRes.data.find(c => c.id === chatId);
           if (current) setCounterpart(getCounterpart(current, user));
         }
       } catch (err: any) {
         setError(err.message || 'Error al cargar el chat');
       } finally {
         setIsLoading(false);
       }
     };
     load();
   }, [accessToken, chatId, isNewChat, user]);

   const onSend = async () => {
     if (!text.trim() || !accessToken || !counterpartCi) return;
     try {
       setIsSending(true);
       const res = await chatController.sendMessage(counterpartCi, text.trim(), accessToken);
       if (!res.success || !res.data) {
         setError(res.message || 'Error al enviar mensaje');
         return;
       }
       setText('');

       // If this was a new chat, navigate to the created chat and then load messages
       const createdChatId = res.data.chatId;
       if (isNewChat || !Number.isFinite(chatId) || chatId <= 0) {
         router.replace(`/chats/${createdChatId}`);
         // Reload messages for the new chat
         const msgsRes = await chatController.getMessages(createdChatId, accessToken);
         if (msgsRes.success) setMessages(msgsRes.data ?? []);
       } else {
         // Existing chat: just reload messages
         const msgsRes = await chatController.getMessages(chatId, accessToken);
         if (msgsRes.success) setMessages(msgsRes.data ?? []);
       }
     } finally {
       setIsSending(false);
     }
   };

   if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <div className="text-lg text-gray-600">Cargando chat...</div>
       </div>
     );
   }

   return (
     <div className="min-h-screen">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="bg-white rounded-2xl shadow-lg border-4 border-surface-dark-70">
           <div className="px-6 py-4 border-b border-gray-200">
             <h1 className="text-2xl font-bold text-secondary-color-70">
               {counterpart?.name || 'Chat'}
             </h1>
           </div>

           {error && (
             <div className="px-6 py-4">
               <div className="bg-accent-danger-10 border border-accent-danger-40 text-accent-danger-40 px-4 py-3 rounded-lg text-sm">
                 {error}
               </div>
             </div>
           )}

           <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
             {messages.length === 0 ? (
               <div className="text-gray-500 text-sm">No hay mensajes aún.</div>
             ) : (
               messages.map((m) => {
                 const mine = m.sendByUserCi === user?.ci;
                 return (
                   <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                     <div className={`px-3 py-2 rounded-lg text-sm ${mine ? 'bg-primary-color-20 text-gray-900' : 'bg-gray-100 text-gray-900'}`}>
                       <div>{m.message}</div>
               <div className="text-[11px] text-gray-500 mt-1">
                         {new Date(m.dateSent).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
           </div>

           <div className="px-6 py-4 border-t border-gray-200">
             <div className="flex items-center space-x-3">
               <input
                 className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-color-60 text-text-neutral-50"
                 placeholder="Escribe un mensaje..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     onSend();
                   }
                 }}
               />
               <button
                 onClick={onSend}
                 disabled={isSending || !text.trim() || !counterpartCi}
                 className="bg-primary-color-70 hover:bg-primary-color-80 text-white font-medium px-4 py-2 rounded-md disabled:opacity-50"
               >
                 {isSending ? 'Enviando...' : 'Enviar'}
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default ChatDetailPage;

