// Bank saran lokal untuk Asisten Pedagogik. Dipakai saat Gemini belum
// tersambung. Jawaban diberi label "lokal" di UI supaya guru tahu sumbernya.

export const QUICK_TOPICS = [
  'Strategi untuk siswa yang tertinggal',
  'Ice breaking 5 menit',
  'Membagi kelompok yang adil',
  'Menulis catatan rapor yang membangun',
];

const BANK: { keys: string[]; answer: string }[] = [
  {
    keys: ['tertinggal', 'diferensiasi', 'lambat', 'remedial'],
    answer:
      'Langkah yang bisa dicoba untuk siswa yang tertinggal:\n\n' +
      '1. Pecah tugas jadi langkah kecil dan beri contoh yang sudah dikerjakan sebagian.\n' +
      '2. Pasangkan dengan teman yang statusnya Aman di mapel yang sama (lihat tab Kelompok).\n' +
      '3. Catat satu hal yang sudah berhasil setiap pertemuan, supaya jurnal tidak hanya berisi kekurangan.\n' +
      '4. Cek ulang setelah dua pertemuan. Kalau status masih Kritis, sampaikan ke wali kelas lewat rapor mapel.',
  },
  {
    keys: ['ice', 'pemanasan', 'pembuka', 'energi'],
    answer:
      'Ice breaking 5 menit "Instruksi Robot":\n\n' +
      '- Satu siswa jadi robot yang hanya mengikuti perintah persis ("maju dua langkah", "putar kanan").\n' +
      '- Kelompok menulis urutan perintah untuk mengambil spidol di meja guru.\n' +
      '- Bahas: kenapa perintah yang ambigu membuat robot gagal? Cocok untuk membuka materi algoritma atau prosedur.',
  },
  {
    keys: ['kelompok', 'grup', 'adil', 'jompang'],
    answer:
      'Supaya kelompok seimbang:\n\n' +
      '1. Gunakan tab Kelompok di dashboard mapel. Siswa dibagi bolak-balik berdasarkan skor jurnal.\n' +
      '2. Beri peran jelas: ketua, mentor sebaya, dan anggota. Peran berganti tiap proyek.\n' +
      '3. Catat jurnal per kelompok di akhir pertemuan dengan tag #kolaboratif atau #pasif_kelompok agar kontribusi tiap siswa terlihat.',
  },
  {
    keys: ['rapor', 'catatan', 'narasi', 'deskripsi'],
    answer:
      'Pola catatan rapor yang membangun:\n\n' +
      '1. Mulai dari bukti: sebut materi dan apa yang sudah dicapai.\n' +
      '2. Satu kekuatan yang spesifik, bukan "baik" saja.\n' +
      '3. Satu langkah perbaikan yang bisa dilakukan di rumah.\n' +
      'Tombol "Susun draf dari jurnal" di halaman rapor mengikuti pola ini dari catatan Anda.',
  },
];

export function localAssistantReply(question: string): string {
  const q = question.toLowerCase();
  const hit = BANK.find((b) => b.keys.some((k) => q.includes(k)));
  if (hit) return hit.answer;
  return (
    'Saya belum punya saran tersimpan untuk pertanyaan itu. Coba salah satu topik cepat di atas, ' +
    'atau sambungkan Gemini lewat Supabase Edge Function agar pertanyaan bebas bisa dijawab.'
  );
}
