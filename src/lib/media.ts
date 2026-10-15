import * as ImagePicker from 'expo-image-picker';

/**
 * Membuka pemilih gambar (galeri di HP, file picker di Web).
 * Menghasilkan data URI base64 atau URL lokal yang siap disimpan dan ditampilkan.
 */
export async function pickImage(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
      return asset.uri;
    }
  } catch (err) {
    console.warn('Gagal memilih gambar dari galeri:', err);
  }
  return null;
}

/**
 * Membuka kamera untuk mengambil foto secara langsung.
 */
export async function takePhoto(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
      return asset.uri;
    }
  } catch (err) {
    console.warn('Gagal mengambil foto dengan kamera:', err);
  }
  return null;
}
