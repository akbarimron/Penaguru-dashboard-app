import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Chip, EnterView, IconButton, MarkdownView } from '../components/ui';
import { focusStyle } from '../components/ui/PressableScale';
import { QUICK_TOPICS } from '../lib/assistant';
import { useLayout } from '../lib/layout';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../store/useUiStore';
import { color, font, radius, space } from '../theme/tokens';
import { ChatMessage } from '../types';

export function AssistantScreen() {
  const chat = useAppStore((s) => s.chat);
  const busy = useAppStore((s) => s.assistantBusy);
  const ask = useAppStore((s) => s.askAssistant);
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [chat.length, busy]);

  const send = async (q?: string) => {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    setText('');
    try {
      await ask(question);
    } catch (e: any) {
      toast(e?.message || 'Asisten tidak dapat menjawab sekarang.', 'error');
    }
  };

  const inner = { width: '100%' as const, maxWidth: Math.min(layout.contentMaxWidth, 820), alignSelf: 'center' as const, paddingHorizontal: layout.gutter };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
      <View style={[inner, { paddingTop: space.md, gap: 10 }]}>
        <View>
          <AppText variant="display" accessibilityRole="header">
            Asisten
          </AppText>
          <AppText variant="small" tone={color.muted}>
            Saran strategi mengajar bertenaga Google Gemini AI. Tanyakan ide ice breaking, diferensiasi, atau rubrik asesmen.
          </AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {QUICK_TOPICS.map((t) => (
            <Chip key={t} label={t} icon="bulb-outline" asButton onPress={() => send(t)} accessibilityLabel={`Tanyakan: ${t}`} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        ref={listRef}
        data={chat}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={[inner, { paddingVertical: space.md, gap: 12 }]}
        renderItem={({ item, index }) => <Bubble message={item} index={index} />}
        ListFooterComponent={
          busy ? (
            <View style={styles.typing} accessibilityLiveRegion="polite">
              <ActivityIndicator size="small" color={color.brand} />
              <AppText variant="small" tone={color.muted}>
                Gemini sedang menyusun saran terbaik...
              </AppText>
            </View>
          ) : null
        }
      />
      <View style={styles.inputWrap}>
        <View style={[inner, styles.inputRow]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tanyakan strategi mengajar..."
            placeholderTextColor={color.mutedOnWhite}
            multiline
            accessibilityLabel="Pertanyaan untuk asisten"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={(e: any) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault?.();
                send();
              }
            }}
            style={[styles.input, { borderColor: focused ? color.brand : color.lineStrong, borderWidth: focused ? 2 : 1.5 }, focusStyle(false)]}
          />
          <IconButton icon="send" label="Kirim pertanyaan" variant="brand" onPress={() => send()} disabled={!text.trim() || busy} size={48} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ message, index }: { message: ChatMessage; index: number }) {
  const user = message.sender === 'user';
  return (
    <EnterView index={Math.min(index, 1)} style={{ alignItems: user ? 'flex-end' : 'flex-start' }}>
      <View style={[styles.bubble, user ? styles.userBubble : styles.botBubble]}>
        {!user && message.source === 'gemini' ? (
          <View style={styles.geminiBadgeHeader}>
            <Ionicons name="sparkles" size={13} color={color.brand} />
            <Text style={styles.geminiBadgeText}>Gemini AI Pedagogik</Text>
          </View>
        ) : null}

        <MarkdownView content={message.text} isUser={user} />

        {!user ? (
          <View style={styles.bubbleFoot}>
            <View style={styles.source}>
              <Ionicons
                name={message.source === 'gemini' ? 'cloud-done' : 'library-outline'}
                size={12}
                color={message.source === 'gemini' ? color.brand : color.muted}
              />
              <AppText variant="caption" tone={message.source === 'gemini' ? color.brandDeep : color.muted}>
                {message.source === 'gemini' ? 'Tersambung Google Gemini' : 'Saran lokal'}
              </AppText>
            </View>
            {message.id !== 'welcome' ? (
              <IconButton
                icon="copy-outline"
                label="Salin saran"
                variant="ghost"
                size={34}
                iconColor={color.brand}
                onPress={async () => {
                  await Clipboard.setStringAsync(message.text);
                  toast('Saran disalin ke clipboard! Siap ditempel ke modul ajar.');
                }}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </EnterView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '92%', padding: 14, borderRadius: radius.lg, gap: 8 },
  userBubble: { backgroundColor: color.brand, borderBottomRightRadius: 6 },
  botBubble: { backgroundColor: color.surface, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: color.line },
  geminiBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: color.brandSoft,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  geminiBadgeText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: color.brandDeep,
    fontWeight: '700',
  },
  bubbleFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: '#F1F5F9' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  inputWrap: { borderTopWidth: 1, borderTopColor: color.line, backgroundColor: color.surface, paddingVertical: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    fontFamily: font.medium,
    fontSize: 15,
    color: color.ink,
    backgroundColor: color.surface,
  },
});
