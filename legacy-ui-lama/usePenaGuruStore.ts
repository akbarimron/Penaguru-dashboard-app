// src/store/usePenaGuruStore.ts
import { create } from 'zustand';
import {
  mockAnalytics,
  mockClasses,
  mockFeedbacks,
  mockJournals,
  mockStudents,
  mockStudyGroups,
  mockTeacher,
} from '../data/mockData';
import {
  ChatMessage,
  ClassRoom,
  DailyJournal,
  PersonalizedFeedback,
  Student,
  StudentAnalytics,
  StudyGroup,
  Teacher,
} from '../types';
import { syncStorage } from '../api/supabase';

interface PenaGuruState {
  // Profiles & Classes
  teacher: Teacher;
  classes: ClassRoom[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;

  // Students & Analytics
  students: Student[];
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  analytics: Record<string, StudentAnalytics>;

  // Journals
  journals: DailyJournal[];
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  addJournal: (newJournal: Omit<DailyJournal, 'id' | 'created_at' | 'is_synced'>) => Promise<DailyJournal>;
  syncPendingJournals: () => Promise<number>;

  // Feedbacks
  feedbacks: Record<string, PersonalizedFeedback>;
  isGeneratingAI: boolean;
  generateAIFeedback: (studentId: string, periode: string) => Promise<PersonalizedFeedback>;
  updateFeedbackDraft: (studentId: string, updates: Partial<PersonalizedFeedback>) => void;
  approveFeedback: (studentId: string) => void;

  // Study Groups
  studyGroups: StudyGroup[];
  generateBalancedGroups: (classId: string, groupCount: number) => void;
  swapGroupMembers: (groupId1: string, studentId1: string, groupId2: string, studentId2: string) => void;

  // Chatbot
  chatMessages: ChatMessage[];
  isChatbotTyping: boolean;
  sendChatMessage: (text: string) => Promise<void>;
}

export const usePenaGuruStore = create<PenaGuruState>((set, get) => ({
  teacher: mockTeacher,
  classes: mockClasses,
  selectedClassId: 'c-001',
  setSelectedClassId: (id) => set({ selectedClassId: id }),

  students: mockStudents,
  selectedStudentId: 's-001',
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
  analytics: mockAnalytics,

  journals: mockJournals,
  isOfflineMode: false,
  toggleOfflineMode: () => set((state) => ({ isOfflineMode: !state.isOfflineMode })),

  addJournal: async (journalInput) => {
    const { isOfflineMode, journals } = get();
    const id = `j-${Date.now()}`;
    const newJournal: DailyJournal = {
      ...journalInput,
      id,
      created_at: new Date().toISOString(),
      is_synced: !isOfflineMode,
    };

    // Optimistic UI state update
    set({ journals: [newJournal, ...journals] });

    // Update running average for student
    const student = get().students.find((s) => s.id === journalInput.student_id);
    if (student) {
      const studentJournals = [newJournal, ...journals.filter((j) => j.student_id === student.id)];
      const avgKog = Math.round(
        (studentJournals.reduce((acc, curr) => acc + curr.nilai_kognitif, 0) / studentJournals.length) * 20
      );
      const avgKet = Math.round(
        (studentJournals.reduce((acc, curr) => acc + curr.nilai_keterampilan, 0) / studentJournals.length) * 20
      );
      const avgSos = Number(
        (studentJournals.reduce((acc, curr) => acc + curr.skor_sikap, 0) / studentJournals.length).toFixed(1)
      );

      let newStatus = student.status_akademik;
      if (avgKog < 60 || avgKet < 55) newStatus = 'Kritis';
      else if (avgKog < 75 || avgKet < 70) newStatus = 'Perhatian';
      else newStatus = 'Aman';

      const updatedStudents = get().students.map((s) =>
        s.id === student.id
          ? {
              ...s,
              rerata_kognitif: avgKog,
              rerata_keterampilan: avgKet,
              rerata_sosial: avgSos,
              status_akademik: newStatus,
            }
          : s
      );
      set({ students: updatedStudents });
    }

    if (isOfflineMode) {
      await syncStorage.addToQueue({
        table: 'daily_journals',
        action: 'insert',
        payload: newJournal,
      });
    }

    return newJournal;
  },

  syncPendingJournals: async () => {
    const pendingList = get().journals.filter((j) => !j.is_synced);
    if (pendingList.length === 0) return 0;

    // Simulate online upload batch sync to Supabase
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 800));

    set((state) => ({
      isOfflineMode: false,
      journals: state.journals.map((j) => ({ ...j, is_synced: true })),
    }));
    await syncStorage.clearQueue();

    return pendingList.length;
  },

  feedbacks: mockFeedbacks,
  isGeneratingAI: false,

  generateAIFeedback: async (studentId: string, periode: string) => {
    set({ isGeneratingAI: true });
    const student = get().students.find((s) => s.id === studentId);
    const studentJournals = get().journals.filter((j) => j.student_id === studentId);

    // Simulate Gemini 1.5/2.0 Flash structured generation latency (1.2 seconds)
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1400));

    const studentName = student ? student.nama_lengkap : 'Peserta Didik';
    const kogScore = student ? student.rerata_kognitif : 80;
    const ketScore = student ? student.rerata_keterampilan : 80;

    const isHighPerformer = kogScore >= 80;
    const keunggulanText = isHighPerformer
      ? `Menunjukkan kecakapan luar biasa pada logika algoritmik, abstraksi konsep, dan ketelitian pengodean mandiri.`
      : `Menunjukkan motivasi belajar yang konsisten, etika bertanya yang santun, dan ketekunan saat menyelesaikan tugas terpandu.`;

    const rekomendasiText = isHighPerformer
      ? `Dorong ananda untuk memimpin sesi mentoring kelompok sebaya dan mengeksplorasi optimasi efisiensi kompleksitas waktu.`
      : `Disarankan mengikuti sesi latihan terstruktur 15 menit per hari dengan tracing tabel variabel dan latihan pembacaan pesan error Python.`;

    const narasiSiswaText = `Ananda ${studentName} menunjukkan capaian yang ${
      isHighPerformer ? 'sangat memuaskan' : 'berkembang baik'
    } pada materi pemrograman Python di periode ${periode}. Penguasaan logika bernilai ${kogScore} dan praktikum bernilai ${ketScore}. Terus pertahankan kedisiplinan dan asah kemampuan kolaborasi bersama rekan sejawat.`;

    const catatanWaliText = `Yth. Orang Tua/Wali dari ananda ${studentName}, kami mengapresiasi semangat belajar ananda di sekolah selama pembelajaran Informatika. Ananda memiliki potensi besar dalam pemecahan masalah komputasi. Mohon dukungan dan pendampingan di rumah agar terus mengasah minat belajarnya.`;

    const feedbackObj: PersonalizedFeedback = {
      id: `fb-${Date.now()}`,
      student_id: studentId,
      student_nama: studentName,
      class_id: get().selectedClassId,
      teacher_id: get().teacher.id,
      periode_semester: periode,
      keunggulan: keunggulanText,
      rekomendasi_peningkatan: rekomendasiText,
      narasi_rapor_siswa: narasiSiswaText,
      catatan_wali_murid: catatanWaliText,
      status_approval: 'Draft',
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      isGeneratingAI: false,
      feedbacks: {
        ...state.feedbacks,
        [studentId]: feedbackObj,
      },
    }));

    return feedbackObj;
  },

  updateFeedbackDraft: (studentId, updates) => {
    set((state) => {
      const existing = state.feedbacks[studentId];
      if (!existing) return state;
      return {
        feedbacks: {
          ...state.feedbacks,
          [studentId]: { ...existing, ...updates },
        },
      };
    });
  },

  approveFeedback: (studentId) => {
    set((state) => {
      const existing = state.feedbacks[studentId];
      if (!existing) return state;
      return {
        feedbacks: {
          ...state.feedbacks,
          [studentId]: {
            ...existing,
            status_approval: 'Approved',
            approved_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  studyGroups: mockStudyGroups,

  generateBalancedGroups: (classId, groupCount) => {
    const classStudents = get().students.filter((s) => s.class_id === classId);
    if (classStudents.length === 0) return;

    // Calculate composite scores (Cognitive 45% + Skill 45% + Social 10%)
    const scoredStudents = [...classStudents].map((s) => ({
      student: s,
      score: s.rerata_kognitif * 0.45 + s.rerata_keterampilan * 0.45 + s.rerata_sosial * 2,
    }));

    // Sort descending by composite score
    scoredStudents.sort((a, b) => b.score - a.score);

    // Distribute via serpentine / snake draft algorithm to eliminate free-rider clustering
    const groups: {
      id: string;
      class_id: string;
      nama_kelompok: string;
      topik_proyek: string;
      strategi_grouping: string;
      rerata_skor_tim: number;
      members: {
        student_id: string;
        student_nama: string;
        peran: 'Ketua' | 'Programmer' | 'Tester' | 'Mentor Sebaya';
        skor_kombinasi: number;
      }[];
    }[] = Array.from({ length: groupCount }, (_, i) => ({
      id: `group-gen-${i + 1}`,
      class_id: classId,
      nama_kelompok: `Kelompok ${i + 1} (${['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega'][i % 6]} Squad)`,
      topik_proyek: `Studi Kasus Proyek Mini Praktikum ${i + 1}`,
      strategi_grouping: 'Heterogen Berimbang (Anti-Jompang)',
      rerata_skor_tim: 0,
      members: [],
    }));

    scoredStudents.forEach((item, index) => {
      // Serpentine distribution
      const cycle = Math.floor(index / groupCount);
      const isReverse = cycle % 2 === 1;
      const targetGroupIndex = isReverse ? groupCount - 1 - (index % groupCount) : index % groupCount;

      let role: 'Ketua' | 'Programmer' | 'Tester' | 'Mentor Sebaya' = 'Programmer';
      if (groups[targetGroupIndex].members.length === 0) {
        role = 'Ketua';
      } else if (item.score >= 80) {
        role = 'Mentor Sebaya';
      } else if (item.score < 65) {
        role = 'Tester';
      }

      groups[targetGroupIndex].members.push({
        student_id: item.student.id,
        student_nama: item.student.nama_lengkap,
        peran: role,
        skor_kombinasi: Math.round(item.score),
      });
    });

    // Calculate group averages
    groups.forEach((g) => {
      const total = g.members.reduce((acc, m) => acc + m.skor_kombinasi, 0);
      g.rerata_skor_tim = Number((total / (g.members.length || 1)).toFixed(1));
    });

    set({ studyGroups: groups });
  },

  swapGroupMembers: (groupId1, studentId1, groupId2, studentId2) => {
    set((state) => {
      const g1 = state.studyGroups.find((g) => g.id === groupId1);
      const g2 = state.studyGroups.find((g) => g.id === groupId2);
      if (!g1 || !g2) return state;

      const m1 = g1.members.find((m) => m.student_id === studentId1);
      const m2 = g2.members.find((m) => m.student_id === studentId2);
      if (!m1 || !m2) return state;

      const updatedGroups = state.studyGroups.map((group) => {
        if (group.id === groupId1) {
          return {
            ...group,
            members: group.members.map((m) => (m.student_id === studentId1 ? { ...m2, peran: m.peran } : m)),
          };
        }
        if (group.id === groupId2) {
          return {
            ...group,
            members: group.members.map((m) => (m.student_id === studentId2 ? { ...m1, peran: m.peran } : m)),
          };
        }
        return group;
      });

      return { studyGroups: updatedGroups };
    });
  },

  chatMessages: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Halo Pak Hendra! Saya Asisten Pedagogik AI PenaGuru. Ada topik praktikum Informatika atau strategi penanganan siswa yang ingin didiskusikan hari ini?',
      timestamp: '08:00',
      suggestions: [
        'Diferensiasi Siswa Tertinggal Python',
        'Analogi Nyata Konsep Loop & Percabangan',
        'Ice Breaking Logika Komputasi (5 Menit)',
      ],
    },
  ],
  isChatbotTyping: false,

  sendChatMessage: async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isChatbotTyping: true,
    }));

    // Simulate Gemini Assistant Reasoning Latency
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));

    let reply = `Tentu Pak Hendra. Berdasarkan pengamatan terhadap karakteristik kelas X RPL: \n\n1. **Analogi Dunia Nyata:** Gunakan analogi "Lampu Lalu Lintas & Tiket Bioskop" untuk menjelaskan logika if-elif-else.\n2. **Scaffolding Bertingkat:** Berikan template kode dengan titik-titik (fill-in-the-blank) sebelum siswa menulis script utuh.\n3. **Peer-Tutoring:** Pasangkan siswa seperti Arya Ramadan dengan Ahmad Rayhan atau Siti Nadira agar tercipta kolaborasi sebaya yang hangat.`;

    if (text.toLowerCase().includes('ice breaking')) {
      reply = `Ide Ice Breaking Cepat (5 Menit): "Tebak Robot Manusia"\n\n• Minta satu siswa menjadi Robot yang hanya paham perintah kaku ("Maju 1 langkah", "Putar kanan 90 derajat").\n• Siswa lain menulis "kode" perintah di kertas untuk mengambil spidol.\n• Pelajaran: Menunjukkan bahwa komputer butuh instruksi presisi tanpa asumsi (berpikir algoritmik)!`;
    } else if (text.toLowerCase().includes('loop') || text.toLowerCase().includes('perulangan')) {
      reply = `Strategi Mengajar Loop Bersarang (Nested Loop):\n\n• **Analogi:** Jam dinding (Jarum Menit berputar 60 kali untuk tiap 1 putaran Jarum Jam).\n• **Latihan Bertahap:**\n  1. Level 1: Cetak pola garis horizontal (* * * * *)\n  2. Level 2: Gandakan jadi persegi 5x5 menggunakan nested for.\n  3. Level 3: Cetak segitiga siku-siku bertingkat.\n• Tip: Ajak siswa membuat tabel tracing variabel 'i' dan 'j' di papan tulis.`;
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionLabel: 'Terapkan ke Modul Ajar',
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, aiMsg],
      isChatbotTyping: false,
    }));
  },
}));
