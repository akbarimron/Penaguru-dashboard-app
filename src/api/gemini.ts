// Integrasi Google Gemini API untuk Asisten Pedagogik & Narasi Rapor PenaGuru
// Menggunakan REST API resmi Google AI Studio (endpoint v1beta) yang kompatibel
// dengan Web, Expo, dan Mobile tanpa ketergantungan library node native tambahan.

declare const process: { env: Record<string, string | undefined> };

const rawKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(
  rawKey &&
  rawKey.trim().length > 10 &&
  !rawKey.includes('your-gemini') &&
  !rawKey.includes('placeholder')
);

// Daftar model aktif berurutan dari yang paling stabil/tersedia ke cadangan
const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
] as const;

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const SKIP_MODEL_STATUSES = new Set([400, 404]);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

function parseGeminiJson<T>(rawText: string): T {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Mengirim request ke Gemini REST API dengan retry singkat pada error sementara (503/429)
 * serta fallback otomatis ke daftar model aktif.
 */
async function callGeminiWithFallback(
  payload: Record<string, unknown>,
  models: readonly string[] = GEMINI_MODELS
): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi di file .env.');
  }

  const apiKey = rawKey!.trim();
  let lastError: Error | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    // 2 model utama diberi 1x retry tambahan jika mengalami lonjakan trafik sementara (503/429)
    const maxAttempts = i < 2 ? 2 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          lastError = new Error(`Gemini ${model} error (${res.status}): ${errorText}`);

          if (RETRYABLE_STATUSES.has(res.status)) {
            if (attempt + 1 < maxAttempts) {
              await sleep(600);
              continue;
            }
            break; // lanjut ke model fallback berikutnya
          }

          if (SKIP_MODEL_STATUSES.has(res.status)) {
            break; // model tidak tersedia/invalid, lanjut ke model berikutnya
          }

          throw lastError;
        }

        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const reply = Array.isArray(parts)
          ? parts
              .filter((p: any) => !p?.thought && typeof p?.text === 'string')
              .map((p: any) => p.text)
              .join('')
          : '';
        if (reply.trim()) {
          return reply.trim();
        }
        lastError = new Error(`Gemini ${model} mengembalikan respons kosong.`);
        break;
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt + 1 < maxAttempts) {
          await sleep(400);
          continue;
        }
      }
    }

    if (i + 1 < models.length) {
      await sleep(200);
    }
  }

  throw lastError || new Error('Gagal mendapatkan respon dari Google Gemini API.');
}

const GEMINI_SYSTEM_PROMPT = `
Kamu Asisten Pedagogik AI PenaGuru untuk guru Indonesia (Kurikulum Merdeka, diferensiasi, remedial/pengayaan, asesmen autentik).
Aturan jawaban:
1. Praktis, terstruktur (poin singkat), santun, dan langsung aplikatif di kelas.
2. WAJIB analisis & sebutkan nama siswa, nilai riil, kriteria, kelompok, atau jurnal dari [DATA PENAGURU] bila tersedia (untuk ranking/remedial/wali kelas/pembagian kelompok).
3. Jika data belum lengkap, arahkan ke menu Penilaian/Nilai Kelas.
`.trim();

/**
 * Mengirim pertanyaan guru ke model Gemini dengan sistem prompt pedagogik dan konteks data kelas.
 */
export async function askGeminiPedagogy(
  question: string,
  history?: { sender: 'user' | 'assistant'; text: string }[],
  context?: { teacherName?: string; schoolName?: string; subjectName?: string; workspaceSummary?: string }
): Promise<string> {
  const buildContextNote = (maxChars: number): string => {
    if (context?.workspaceSummary) {
      const trimmed = context.workspaceSummary.trim();
      return trimmed.length > maxChars ? `\n${trimmed.slice(0, maxChars)}\n...(ringkas)` : `\n${trimmed}`;
    }
    if (context) {
      return `\nKonteks: Guru ${context.teacherName || 'Guru'}, Sekolah ${context.schoolName || '-'}, Mapel ${context.subjectName || '-'}.`;
    }
    return '';
  };

  // Batasi riwayat percakapan agar ukuran payload tetap di bawah ambang batas gateway API
  const conversationTurns = (history || [])
    .filter((h) => h.text && h.text.trim().length > 0 && h.text !== question && !h.text.startsWith('Halo! Saya bisa membantu'))
    .slice(-4)
    .map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text.length > 220 ? `${h.text.slice(0, 220)}...` : h.text }],
    }));

  const makePayload = (maxSummaryChars: number, includeHistory: boolean) => ({
    contents: [
      ...(includeHistory ? conversationTurns : []),
      {
        role: 'user',
        parts: [{ text: `${question}${buildContextNote(maxSummaryChars)}` }],
      },
    ],
    systemInstruction: {
      parts: [{ text: GEMINI_SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 900,
    },
  });

  try {
    return await callGeminiWithFallback(makePayload(2000, true));
  } catch (err) {
    // Jika masih terkena limit kapasitas saat trafik padat, coba ulang dengan ringkasan ultra-padat tanpa riwayat chat
    if (context?.workspaceSummary && context.workspaceSummary.length > 700) {
      return callGeminiWithFallback(makePayload(700, false));
    }
    throw err;
  }
}

/**
 * Menyusun draf narasi rapor berbasis catatan jurnal menggunakan Gemini AI (Teacher-in-the-Loop)
 */
export async function generateGeminiReportDraft(params: {
  studentName: string;
  subjectName: string;
  periode: string;
  journalsSummary: string;
  scores: { kognitif: number; keterampilan: number; sikap: number };
}): Promise<{
  keunggulan: string;
  rekomendasi: string;
  narasi: string;
  pesan_wali: string;
}> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi.');
  }

  const prompt = `
Sebagai Guru Pengampu di Kurikulum Merdeka, susunlah draf catatan rapor dan pesan wali murid untuk siswa berikut:
Nama Siswa: ${params.studentName}
Mata Pelajaran: ${params.subjectName}
Periode: ${params.periode}
Rata-rata Nilai: Pengetahuan ${params.scores.kognitif}, Keterampilan ${params.scores.keterampilan}, Sikap ${params.scores.sikap} (skala 100).

Riwayat Lengkap Catatan Pengamatan Jurnal Harian (Daily Journal):
${params.journalsSummary}

INSTRUKSI PENTING:
1. Kamu WAJIB membaca dan mendalami SELURUH catatan daily journal di atas (materi, proses belajar, perkembangan tanggal ke tanggal, tag perilaku, dan kalimat observasi guru).
2. Jangan hanya berpatokan pada angka rata-rata! Kutip atau rujuk kemajuan konkret siswa pada materi dan peristiwa pembelajaran yang tercatat di daily journal.
3. "keunggulan": 1-2 kalimat apresiasi autentik berdasarkan materi yang paling dikuasai dan sikap positif yang tercatat di daily journal.
4. "rekomendasi": 1-2 kalimat langkah konkret tindak lanjut/perbaikan pada materi atau kompetensi yang perlu perhatian di daily journal.
5. "narasi": Paragraf narasi rapor resmi Kurikulum Merdeka (60-80 kata) yang memadukan materi yang dipelajari, capaian kompetensi, dan proses belajar siswa.
6. "pesan_wali": Pesan hangat dan personal untuk orang tua yang menyebutkan capaian ananda di kelas secara apresiatif.

Berikan output HANYA dalam format JSON valid tanpa tag markdown lain, dengan struktur:
{
  "keunggulan": "1-2 kalimat keunggulan autentik siswa",
  "rekomendasi": "1-2 kalimat langkah konkret tindak lanjut/perbaikan",
  "narasi": "Paragraf lengkap narasi rapor resmi",
  "pesan_wali": "Pesan personal yang hangat untuk orang tua/wali murid"
}
`.trim();

  const rawJson = await callGeminiWithFallback({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  return parseGeminiJson(rawJson);
}

/**
 * Menyusun draf catatan wali kelas berbasis capaian semua mapel & catatan jurnal menggunakan Gemini AI
 */
export async function generateHomeroomNoteAI(params: {
  studentName: string;
  className: string;
  periode: string;
  perSubjectSummary: string;
  journalHighlights: string;
}): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi.');
  }

  const prompt = `
Sebagai Wali Kelas di sekolah Indonesia (Kurikulum Merdeka), susunlah narasi "Catatan Wali Kelas" resmi untuk rapor siswa berikut:
Nama Siswa: ${params.studentName}
Kelas: ${params.className}
Periode: ${params.periode}

Rangkuman Capaian Lintas Mata Pelajaran:
${params.perSubjectSummary}

Seluruh Riwayat Catatan Daily Journal & Observasi Guru Mapel:
${params.journalHighlights || '(Belum ada catatan jurnal harian)'}

INSTRUKSI PENTING:
1. BACA DAN ANALISIS SECARA MENYELURUH setiap catatan daily journal dari seluruh guru mapel di atas (materi yang dipelajari, nilai harian, tag, dan kalimat catatan guru).
2. Identifikasi kelebihan dan tantangan belajar siswa berdasarkan fakta catatan nyata dari para guru mapel.
3. Susun narasi 1 paragraf ringkas (sekitar 60-90 kata) yang:
   - Mengapresiasi keunggulan, keaktifan, atau kemajuan belajar siswa yang tercatat di daily journal.
   - Menyampaikan aspek yang perlu pendampingan/peningkatan secara membangun, solutif, dan bijak (misal: pengulangan latihan mandiri di rumah).
   - Menutup dengan kalimat motivasi hangat yang menyemangati ananda untuk semester berikutnya.
4. Berikan HANYA teks narasi catatan, tanpa tanda kutip atau kalimat pembuka/penutup.
`.trim();

  return callGeminiWithFallback({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
  });
}

/**
 * Menyusun pesan personal WhatsApp untuk Wali Murid / Orang Tua berbasis riwayat perkembangan siswa
 */
export async function generateParentMessageAI(params: {
  studentName: string;
  parentName?: string;
  className: string;
  periode: string;
  overviewSummary: string;
}): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi.');
  }

  const prompt = `
Sebagai Wali Kelas, susunlah draf pesan WhatsApp yang santun, hangat, dan profesional kepada orang tua/wali murid berikut:
Nama Siswa: ${params.studentName}
Nama Orang Tua/Wali: ${params.parentName || 'Bapak/Ibu Orang Tua/Wali'}
Kelas: ${params.className}
Periode: ${params.periode}

Rangkuman Capaian & Seluruh Riwayat Daily Journal:
${params.overviewSummary}

INSTRUKSI PENTING:
1. BACA DAN RESAPI seluruh catatan daily journal di atas. Sebutkan secara autentik contoh materi pelajaran atau kegiatan positif yang telah dijalani ananda di kelas.
2. Sampaikan kabar perkembangan belajar ananda secara apresiatif, hangat, dan komunikatif.
3. Berikan 1-2 saran konkret untuk pendampingan belajar di rumah berdasarkan catatan guru mapel di daily journal.
4. Tutup dengan ajakan kerjasama demi kesuksesan ananda dan doa terbaik.
5. Berikan HANYA teks pesan WhatsApp lengkap (boleh gunakan emotikon ramah yang wajar).
`.trim();

  return callGeminiWithFallback({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
  });
}

/**
 * Mentranskripsikan rekaman audio suara guru menjadi teks catatan pengamatan jurnal menggunakan Gemini AI
 */
export async function transcribeAudioWithGemini(
  base64Audio: string,
  mimeType = 'audio/webm'
): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi.');
  }

  const prompt = `Transkripsikan rekaman suara guru ini ke dalam teks catatan pengamatan kelas/jurnal harian bahasa Indonesia yang rapi dan akurat. Perbaiki sedikit jika ada kata yang terputus, tanpa mengubah maksud guru. Berikan HANYA teks transkripsi tanpa basa-basi atau tanda kutip.`;

  return callGeminiWithFallback({
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
    },
  });
}

/**
 * Menganalisis dikte suara guru dan memetakan otomatis ke skor (1-5), tag observasi, nama siswa, dan catatan bersih.
 */
export async function parseVoiceJournalWithAI(params: {
  voiceText: string;
  availableStudents: { id: string; nama_lengkap: string }[];
  currentMateri?: string;
}): Promise<{
  catatan: string;
  matchedStudentIds: string[];
  nilai_kognitif?: number | null;
  nilai_keterampilan?: number | null;
  skor_sikap?: number | null;
  tags: string[];
}> {
  if (!isGeminiConfigured) {
    return {
      catatan: params.voiceText,
      matchedStudentIds: [],
      tags: [],
    };
  }

  const studentList = params.availableStudents.map((s) => `- ${s.nama_lengkap} (ID: ${s.id})`).join('\n');

  const prompt = `
Sebagai Asisten PenaGuru, kamu menerima teks hasil dikte suara seorang guru saat mengamati siswa di kelas:
"${params.voiceText}"

Daftar siswa di kelas ini:
${studentList}

Tugasmu:
1. "catatan": Rapikan kalimat dikte guru menjadi 1-2 kalimat catatan pengamatan observasi yang profesional, spesifik, dan siap disimpan ke jurnal kelas.
2. "matchedStudentIds": Cocokkan nama siswa yang disebut oleh guru di teks dikte dengan ID siswa di atas. Jika tidak ada yang cocok atau tidak disebut, biarkan array kosong [].
3. "nilai_kognitif", "nilai_keterampilan", "skor_sikap": Jika guru menyebut angka skor (misal "skor 5 4 4" atau "nilainya 4 semua"), ekstrak nilainya (skala 1-5). Jika tidak disebut, beri null.
4. "tags": Pilih 1-3 tag karakter yang relevan dari kata-kata guru (misal: "Aktif bertanya", "Kolaboratif", "Fokus", "Perlu bimbingan", "Kritis", "Teliti").

Keluarkan HANYA JSON valid:
{
  "catatan": "teks catatan rapi",
  "matchedStudentIds": ["id1"],
  "nilai_kognitif": 5,
  "nilai_keterampilan": 4,
  "skor_sikap": 5,
  "tags": ["Aktif bertanya"]
}
`.trim();

  try {
    const rawJson = await callGeminiWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });
    return parseGeminiJson(rawJson);
  } catch (err) {
    console.warn('AI Voice parse failed:', err);
  }

  return {
    catatan: params.voiceText,
    matchedStudentIds: [],
    tags: [],
  };
}
