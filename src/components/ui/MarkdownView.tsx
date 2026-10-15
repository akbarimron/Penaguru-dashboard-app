import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, font, radius } from '../../theme/tokens';
import { AppText } from './AppText';

interface MarkdownViewProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownView({ content, isUser = false }: MarkdownViewProps) {
  if (isUser) {
    return (
      <AppText variant="body" tone="#FFFFFF" selectable>
        {content}
      </AppText>
    );
  }

  // Bersihkan simbol latex arrows yang umum dipakai LLM
  const sanitized = content
    .replace(/\$\\rightarrow\$/g, '➔')
    .replace(/\$\\to\$/g, '➔')
    .replace(/\$\\leftarrow\$/g, '←')
    .replace(/\\rightarrow/g, '➔')
    .replace(/->/g, '➔');

  // Pisahkan berdasarkan baris
  const lines = sanitized.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const { type, items } = currentList;
    elements.push(
      <View key={`list-${elements.length}`} style={styles.listContainer}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.listItemRow}>
            {type === 'number' ? (
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{idx + 1}</Text>
              </View>
            ) : (
              <Text style={styles.bulletDot}>•</Text>
            )}
            <View style={styles.listItemTextWrap}>{renderInline(item, false)}</View>
          </View>
        ))}
      </View>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Baris Kosong
    if (!line) {
      flushList();
      continue;
    }

    // 2. Garis Pembatas (--- atau ***)
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      elements.push(<View key={`hr-${i}`} style={styles.divider} />);
      continue;
    }

    // 3. Header 1 / 2 / 3 (### Heading)
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      flushList();
      const level = line.startsWith('### ') ? 3 : line.startsWith('## ') ? 2 : 1;
      const text = line.replace(/^#{1,3}\s+/, '');
      elements.push(
        <View key={`heading-${i}`} style={[styles.headingWrap, level === 1 && styles.heading1Wrap]}>
          <AppText
            variant={level === 1 ? 'title' : 'heading'}
            weight="extrabold"
            tone={color.brandDeep}
            style={styles.headingText}
          >
            {renderInline(text, false)}
          </AppText>
        </View>
      );
      continue;
    }

    // 4. Callout / Tips Guru Profesional (misal: **Tips Guru Profesional:** ...)
    if (
      line.startsWith('**Tips') ||
      line.startsWith('> **Tips') ||
      line.startsWith('> [!TIP]') ||
      line.startsWith('> [!NOTE]')
    ) {
      flushList();
      const tipText = line.replace(/^>\s*/, '');
      elements.push(
        <View key={`tip-${i}`} style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={18} color="#D97706" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>{renderInline(tipText, false)}</View>
        </View>
      );
      continue;
    }

    // 5. Numbered List (1. ...)
    const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push(numberMatch[2]);
      continue;
    }

    // 6. Bullet List (* ... atau - ...)
    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // 7. Paragraf Biasa
    flushList();
    elements.push(
      <View key={`p-${i}`} style={styles.paragraphWrap}>
        <Text style={styles.paragraphText}>{renderInline(line, false)}</Text>
      </View>
    );
  }

  flushList();

  return <View style={styles.container}>{elements}</View>;
}

/**
 * Parsing formatting inline: **bold**, *italic*, `code`
 */
function renderInline(text: string, isUser: boolean): React.ReactNode {
  // Regex untuk memisahkan **bold**, *italic*, dan `code`
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold (**teks**)
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <Text
          key={index}
          style={[styles.boldText, isUser && { color: '#FFFFFF' }]}
        >
          {inner}
        </Text>
      );
    }

    // Italic (*teks*)
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={[styles.italicText, isUser && { color: '#FFFFFF' }]}
        >
          {inner}
        </Text>
      );
    }

    // Inline Code (`teks`)
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={[styles.codeText, isUser && styles.codeUserText]}
        >
          {inner}
        </Text>
      );
    }

    // Teks biasa
    return (
      <Text
        key={index}
        style={[styles.regularText, isUser && { color: '#FFFFFF' }]}
      >
        {part}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  paragraphWrap: {
    marginVertical: 2,
  },
  paragraphText: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 22,
    color: color.ink,
  },
  regularText: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 22,
    color: color.ink,
  },
  boldText: {
    fontFamily: font.bold,
    fontWeight: '700',
    color: color.brandDeep,
  },
  italicText: {
    fontFamily: font.regular,
    fontStyle: 'italic',
    color: color.inkSoft,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    backgroundColor: '#F1F5F9',
    color: color.brand,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  codeUserText: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
  headingWrap: {
    marginTop: 10,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: color.brand,
    paddingLeft: 8,
  },
  heading1Wrap: {
    marginTop: 14,
    borderLeftColor: color.accent,
  },
  headingText: {
    fontSize: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: color.line,
    marginVertical: 8,
    opacity: 0.8,
  },
  listContainer: {
    marginVertical: 4,
    gap: 6,
    paddingLeft: 2,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 22,
    color: color.brand,
    fontWeight: 'bold',
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numberText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: color.brandDeep,
    fontWeight: '700',
  },
  listItemTextWrap: {
    flex: 1,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  tipIcon: {
    fontSize: 18,
    marginTop: 1,
  },
});
