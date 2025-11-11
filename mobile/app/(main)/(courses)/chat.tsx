'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Message = {
  id: string
  sender: 'student' | 'teacher'
  content: string
  createdAt: string
}

type Props = {
  params?: {
    teacherId?: string
    courseId?: string
  }
}

/**
  chat screen
  - displays previous messages (fetched from /chat/history?teacherId=...&courseId=...)
  - send messages via POST /chat/send
    payload: { teacherId: string, courseId?: string, content: string }
*/

export default function Chat({ params }: Props) {
  const teacherId = params?.teacherId ?? ''
  const courseId = params?.courseId ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [text, setText] = useState<string>('')
  const listRef = useRef<FlatList<Message> | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadMessages() {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (teacherId) qs.set('teacherId', teacherId)
        if (courseId) qs.set('courseId', courseId)
        const res = await fetch(`/chat/history?${qs.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!mounted) return
        if (!res.ok) {
          console.warn('Failed to load chat history', res.status)
          setMessages([])
        } else {
          const data = await res.json()
          // Expecting an array of messages with fields id, sender, content, createdAt
          setMessages(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn('Error fetching chat history', err)
        setMessages([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadMessages()
    return () => {
      mounted = false
    }
  }, [teacherId, courseId])

  async function handleSend() {
    const content = text.trim()
    if (!content || !teacherId) return
    setSending(true)
    // optimistic update
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      sender: 'student',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setText('')
    try {
      const payload = {
        teacherId,
        courseId: courseId || undefined,
        content,
      }
      const res = await fetch('/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // rollback optimistic update on error
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        console.warn('Failed to send message', res.status)
      } else {
        const saved = await res.json()
        // replace optimistic message with saved server message (if server returned full message)
        setMessages(prev =>
          prev.map(m => (m.id === optimistic.id && saved?.id ? { ...saved } : m))
        )
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      console.warn('Error sending message', err)
    } finally {
      setSending(false)
      // scroll to end
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150)
    }
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isStudent = item.sender === 'student'
    return (
      <View
        style={[
          styles.messageRow,
          isStudent ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View style={[styles.bubble, isStudent ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <Text style={styles.headerSub}>Teacher: {teacherId || 'Unknown'}</Text>
      </View>

      <View style={styles.messagesContainer}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={styles.messagesContent}
          />
        )}
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Write a message..."
          value={text}
          onChangeText={setText}
          editable={!sending}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, sending || !text.trim() || !teacherId ? styles.sendButtonDisabled : null]}
          onPress={handleSend}
          disabled={sending || !text.trim() || !teacherId}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSub: { fontSize: 12, color: '#666', marginTop: 4 },

  messagesContainer: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  messagesContent: { paddingBottom: 12 },

  messageRow: { marginVertical: 6, flexDirection: 'row' },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleLeft: { backgroundColor: '#f1f1f1', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  bubbleRight: { backgroundColor: '#007aff', alignSelf: 'flex-end', borderTopRightRadius: 4 },
  messageText: { color: '#000' },
  timeText: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' },

  composer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ac6ff',
  },
  sendText: { color: '#fff', fontWeight: '600' },
})