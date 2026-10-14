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

const GEMINI_SYSTEM_PROMPT = `
Kamu adalah Asisten Pedagogik AI resmi di aplikasi PenaGuru (pendamping guru Indonesia).
Karakteristik & Prinsip:
1. Berorientasi pada Kurikulum Merdeka, pembelajaran berdiferensiasi, dan asesmen autentik.
2. Memberikan jawaban yang praktis, aplikatif di kelas, terstruktur (poin-poin jelas), dan empatik terhadap beban kerja guru.
3. Fokus pada solusi nyata: strategi mengajar, diferensiasi siswa tertinggal (remedial/pengayaan), ide ice-breaking 5 menit yang relevan, manajemen kelompok kooperatif, dan perumusan umpan balik asesmen.
4. Gunakan bahasa Indonesia yang santun, profesional, lugas, dan menyemangati guru.
`.trim();

/**
 * Mengirim pertanyaan guru ke model Gemini dengan sistem prompt pedagogik.
 */
export async function askGeminiPedagogy(
  question: string,
  history?: { sender: 'user' | 'assistant'; text: string }[],
  context?: { teacherName?: string; schoolName?: string; subjectName?: string }
): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi di file .env.');
  }

  const apiKey = rawKey!.trim();
  const contextNote = context
    ? `\nKonteks Pengguna: Guru: ${context.teacherName || 'Bapak/Ibu Guru'}, Sekolah: ${context.schoolName || '-'}, Mata Pelajaran: ${context.subjectName || '-'}.`
    : '';

  // Format riwayat percakapan sebelumnya (ambil 6 pesan terakhir agar ingatan konteks tajam)
  const conversationTurns = (history || [])
    .filter((h) => h.text && h.text.trim().length > 0 && h.text !== question && !h.text.startsWith('Halo! Saya bisa membantu'))
    .slice(-6)
    .map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

  const contents = [
    ...conversationTurns,
    {
      role: 'user',
      parts: [{ text: `${question}${contextNote}` }],
    },
  ];

  // Menggunakan model Gemini terbaru: gemini-3.5-flash-lite (cepat & stabil) dan gemini-3.8-flash
  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash'];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        // Bila model tidak ditemukan atau kuota model habis, coba model berikutnya
        if (res.status === 404 || res.status === 400) {
          lastError = new Error(`Gemini ${model} error (${res.status}): ${errorText}`);
          continue;
        }
        throw new Error(`Gemini API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return reply.trim();
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Gagal mendapatkan respon dari Google Gemini API.');
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
Susun draf catatan rapor dan pesan wali murid untuk siswa berikut:
Nama Siswa: ${params.studentName}
Mata Pelajaran: ${params.subjectName}
Periode: ${params.periode}
Rata-rata Nilai: Pengetahuan ${params.scores.kognitif}, Keterampilan ${params.scores.keterampilan}, Sikap ${params.scores.sikap} (skala 100).
Rangkuman Catatan Pengamatan Jurnal Harian:
${params.journalsSummary}

Berikan output HANYA dalam format JSON valid tanpa tag markdown lain, dengan struktur:
{
  "keunggulan": "1-2 kalimat keunggulan autentik siswa",
  "rekomendasi": "1-2 kalimat langkah konkret tindak lanjut/perbaikan",
  "narasi": "Paragraf lengkap narasi rapor resmi",
  "pesan_wali": "Pesan personal yang hangat untuk orang tua/wali murid"
}
`.trim();

  const apiKey = rawKey!.trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status})`);
  }

  const data = await res.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawJson);
}
