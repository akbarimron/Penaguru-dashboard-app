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
4. AKSES DATA KELAS, SISWA, & SELURUH DAILY JOURNAL:
   Kamu diberikan data kelas, daftar nama siswa, catatan lengkap daily journal observasi guru, dan penugasan mengajar di bagian konteks.
   - BACA DAN ANALISIS SEMUA CATATAN DAILY JOURNAL: Jika guru bertanya tentang evaluasi siswa, perkembangan belajar, kendala/hambatan, atau rekap kelas, kamu WAJIB membaca dan menyerap seluruh riwayat catatan daily journal (tanggal, materi, nilai kognitif/keterampilan/sikap, tag karakter, dan kalimat catatan observasi guru). Berikan jawaban yang spesifik berdasarkan fakta catatan-catatan tersebut!
   - Jika guru meminta membagi kelompok (misal: "bagi siswa kelas 10-A jadi 2 kelompok"): GUNAKAN NAMA-NAMA SISWA ASLI dari data kelas guru tersebut! Tampilkan daftar pembagian kelompok yang seimbang dan adil.
   - Jika guru bertanya tentang siswa tertentu atau kelas perwalian (Wali Kelas), jawablah secara rinci berdasarkan data siswa dan riwayat catatan daily journal yang tersedia.
   - Jika belum ada data siswa yang diinputkan guru, beri panduan ramah untuk menambahkan siswa di menu Siswa.
5. Gunakan bahasa Indonesia yang santun, profesional, lugas, dan menyemangati guru.
`.trim();

/**
 * Mengirim pertanyaan guru ke model Gemini dengan sistem prompt pedagogik dan konteks data kelas.
 */
export async function askGeminiPedagogy(
  question: string,
  history?: { sender: 'user' | 'assistant'; text: string }[],
  context?: { teacherName?: string; schoolName?: string; subjectName?: string; workspaceSummary?: string }
): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Kunci Gemini API belum dikonfigurasi di file .env.');
  }

  const apiKey = rawKey!.trim();
  let contextNote = '';
  if (context?.workspaceSummary) {
    contextNote += `\n${context.workspaceSummary}`;
  } else if (context) {
    contextNote += `\nKonteks Pengguna: Guru: ${context.teacherName || 'Bapak/Ibu Guru'}, Sekolah: ${context.schoolName || '-'}, Mata Pelajaran: ${context.subjectName || '-'}.`;
  }

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

  const apiKey = rawKey!.trim();
  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // coba model berikutnya
    }
  }

  throw new Error('Gagal menghasilkan catatan wali kelas dari Gemini AI.');
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

  const apiKey = rawKey!.trim();
  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // coba model berikutnya
    }
  }

  throw new Error('Gagal menghasilkan pesan untuk orang tua dari Gemini AI.');
}
