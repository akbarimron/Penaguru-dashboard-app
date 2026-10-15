import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PRESET_ICONS, resolveClassIcon, resolveSubjectIcon } from '../lib/icons';
import { pickImage, takePhoto } from '../lib/media';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { SubjectColor } from '../types';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { toast } from '../store/useUiStore';

interface CustomAssetModalProps {
  open: boolean;
  onClose: () => void;
  targetType: 'profile' | 'subject' | 'class';
  title: string;
  currentName: string;
  currentColor?: SubjectColor;
  initialIcon?: string | null;
  initialImage?: string | null;
  onSave: (data: { icon?: string | null; image?: string | null }) => Promise<void>;
}

export function CustomAssetModal({
  open,
  onClose,
  targetType,
  title,
  currentName,
  currentColor = 'violet',
  initialIcon,
  initialImage,
  onSave,
}: CustomAssetModalProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(initialIcon || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [saving, setSaving] = useState(false);

  const p = subjectPalette[currentColor] || subjectPalette.violet;

  const handlePickFromGallery = async () => {
    const uri = await pickImage();
    if (uri) {
      setSelectedImage(uri);
      toast('Gambar berhasil dipilih!');
    }
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setSelectedImage(uri);
      toast('Foto berhasil diambil!');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    toast('Gambar dihapus. Menampilkan ikon.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        icon: selectedIcon,
        image: selectedImage,
      });
      toast('Perubahan berhasil disimpan!');
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan perubahan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeIcon =
    targetType === 'class'
      ? resolveClassIcon(currentName, selectedIcon)
      : resolveSubjectIcon(currentName, selectedIcon);

  return (
    <Dialog
      visible={open}
      onClose={onClose}
      title={title}
      footer={
        <View style={{ width: '100%', flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Button
            label="Batal"
            variant="ghost"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            label="Simpan Pengaturan"
            icon="checkmark"
            variant="primary"
            loading={saving}
            onPress={handleSave}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <View style={styles.contentWrap}>
        {/* Preview Card */}
        <View style={styles.previewSection}>
          <AppText variant="caption" weight="bold" tone={color.muted}>
            PRATINJAU TAMPILAN
          </AppText>
          <View
            style={[
              styles.previewBox,
              targetType === 'profile'
                ? styles.profilePreview
                : [styles.subjectPreview, { backgroundColor: p.bg }],
            ]}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={targetType === 'profile' ? styles.profileImg : styles.cardImg}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.iconCircle,
                  targetType === 'profile' ? { backgroundColor: color.brandSoft } : { backgroundColor: p.iconBox },
                ]}
              >
                <Ionicons
                  name={activeIcon as any}
                  size={36}
                  color={targetType === 'profile' ? color.brandDeep : p.fg}
                />
              </View>
            )}
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <AppText
                variant="body"
                weight="bold"
                tone={targetType === 'profile' ? color.ink : p.fg}
                numberOfLines={1}
              >
                {currentName}
              </AppText>
              <AppText
                variant="caption"
                tone={targetType === 'profile' ? color.muted : p.fg}
              >
                {selectedImage ? 'Menggunakan Foto / Gambar' : `Ikon: ${selectedIcon || 'Bawaan'}`}
              </AppText>
            </View>
          </View>
        </View>

        {/* Upload Gambar / Foto Profil */}
        <View style={styles.actionGroup}>
          <AppText variant="caption" weight="bold" tone={color.muted}>
            UPLOAD FOTO / GAMBAR PROFIL
          </AppText>
          <View style={styles.uploadButtons}>
            <Button
              label="Pilih dari Galeri"
              icon="images-outline"
              variant="secondary"
              onPress={handlePickFromGallery}
            />
            <Button
              label="Ambil Kamera"
              icon="camera-outline"
              variant="secondary"
              onPress={handleTakePhoto}
            />
          </View>
          {selectedImage ? (
            <Button
              label="Hapus Foto (Gunakan Ikon Saja)"
              icon="trash-outline"
              variant="ghost"
              fg={color.danger}
              size="sm"
              onPress={handleRemoveImage}
            />
          ) : null}
        </View>

        {/* Pilihan Ikon (Untuk Mapel & Kelas, atau Pengganti Foto) */}
        {targetType !== 'profile' ? (
          <View style={styles.iconSection}>
            <AppText variant="caption" weight="bold" tone={color.muted}>
              ATAU PILIH IKON KHUSUS
            </AppText>
            <AppText variant="caption" tone={color.muted}>
              Pilih ikon representatif jika Anda tidak ingin mengunggah gambar.
            </AppText>
            <View style={styles.iconGrid}>
              {PRESET_ICONS.map((item) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.iconCell,
                      isSelected && {
                        borderColor: color.brand,
                        backgroundColor: color.brandSoft,
                      },
                    ]}
                    onPress={() => setSelectedIcon(item.name)}
                    accessibilityLabel={item.label}
                  >
                    <Ionicons
                      name={item.name as any}
                      size={24}
                      color={isSelected ? color.brandDeep : color.ink}
                    />
                    <AppText
                      variant="caption"
                      numberOfLines={1}
                      tone={isSelected ? color.brandDeep : color.muted}
                      style={{ fontSize: 10, textAlign: 'center' }}
                    >
                      {item.label.split('/')[0].trim()}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    gap: 18,
    paddingVertical: space.xs,
  },
  previewSection: {
    gap: 8,
    alignItems: 'center',
  },
  previewBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
  },
  profilePreview: {
    backgroundColor: color.surface,
  },
  subjectPreview: {
    minHeight: 120,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardImg: {
    width: '100%',
    height: 100,
    borderRadius: radius.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGroup: {
    gap: 8,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  iconSection: {
    gap: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: '22%',
    minWidth: 64,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    gap: 4,
  },
});
