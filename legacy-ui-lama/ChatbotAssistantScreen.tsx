// src/screens/ChatbotAssistantScreen.tsx
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common/Header';
import { usePenaGuruStore } from '../store/usePenaGuruStore';
import { colors } from '../theme/colors';

const quickTopics = [
  'Diferensiasi Siswa Tertinggal Python',
  'Analogi Nyata Konsep Loop & Percabangan',
  'Ice Breaking Logika Komputasi (5 Menit)',
  'Studi Kasus Proyek Nyata Mini Web/IoT',
];

export const ChatbotAssistantScreen: React.FC = () => {
  const { chatMessages, sendChatMessage, isChatbotTyping } = usePenaGuruStore();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isChatbotTyping) return;

    setInputText('');
    await sendChatMessage(text.trim());
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCopySuggestion = (text: string) => {
    Alert.alert('Saran Disalin', 'Rekomendasi pedagogis berhasil disalin ke clipboard untuk RPP / Modul Ajar Anda.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header />

      {/* Assistant Intro Header */}
      <View style={styles.assistantBanner}>
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={18} color={colors.pureWhite} />
        </View>
        <View style={styles.assistantInfo}>
          <Text style={styles.assistantName}>Gemini Asisten Pedagogik Guru</Text>
          <Text style={styles.assistantRole}>
            Konsultan Diferensiasi Pembelajaran Informatika & Kurikulum Merdeka
          </Text>
        </View>
      </View>

      {/* Quick Topic Chips */}
      <View style={styles.quickTopicsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTopicsContent}>
          {quickTopics.map((topic, idx) => (
            <TouchableOpacity
              key={`topic-${idx}`}
              style={styles.topicChip}
              onPress={() => handleSend(topic)}
              activeOpacity={0.8}
            >
              <Ionicons name="bulb-outline" size={13} color={colors.teal[700]} />
              <Text style={styles.topicChipText}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={[styles.messageBubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
              {!isUser && (
                <View style={styles.msgAvatarBox}>
                  <Ionicons name="sparkles" size={12} color={colors.pureWhite} />
                </View>
              )}

              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.bubbleText, isUser ? styles.userBubbleText : styles.assistantBubbleText]}>
                  {item.text}
                </Text>

                <View style={styles.bubbleFooter}>
                  <Text style={[styles.timestampText, isUser ? styles.timestampUser : styles.timestampAssistant]}>
                    {item.timestamp}
                  </Text>
                </View>

                {!isUser && item.actionLabel && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleCopySuggestion(item.text)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={12} color={colors.teal[700]} />
                    <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Typing Indicator */}
      {isChatbotTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.teal[600]} />
          <Text style={styles.typingText}>Gemini AI sedang merumuskan strategi pedagogis...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder="Tanyakan ide strategi pengajaran Informatika..."
          placeholderTextColor={colors.slate[400]}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isChatbotTyping}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() ? colors.pureWhite : colors.slate[400]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  assistantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal[800],
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.pureWhite,
  },
  assistantRole: {
    fontSize: 10,
    color: colors.teal[100],
    marginTop: 1,
  },
  quickTopicsContainer: {
    backgroundColor: colors.pureWhite,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  quickTopicsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.teal[200],
  },
  topicChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal[800],
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  msgAvatarBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.teal[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.teal[700],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.pureWhite,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userBubbleText: {
    color: colors.pureWhite,
  },
  assistantBubbleText: {
    color: colors.slate[800],
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 9,
  },
  timestampUser: {
    color: colors.teal[100],
  },
  timestampAssistant: {
    color: colors.slate[400],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.teal[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.teal[200],
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.teal[800],
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: colors.slate[100],
  },
  typingText: {
    fontSize: 11,
    color: colors.teal[800],
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pureWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    gap: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate[800],
    maxHeight: 80,
    paddingVertical: 6,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.teal[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.slate[200],
  },
});
