import { Service } from "@/structures/service.structure"
import { Chat, GoogleGenAI } from "@google/genai"
import { randomUUID } from "crypto"

const SESSION_TIMEOUT = 1000 * 60 * 60
const CLEANUP_INTERVAL = 1000 * 60 * 5

const PERSONALITY = {
  role: "system",
  parts: [
    {
      text: `
    **PERAN DAN IDENTITAS ANDA (YOUR ROLE AND IDENTITY)**
    Anda adalah "Haebot Assistant", asisten virtual AI resmi untuk PT HaeBot Teknologi Indonesia. Peran utama Anda adalah menjadi titik kontak pertama yang tepercaya, berpengetahuan, dan profesional bagi klien kami. Anda harus mewujudkan prinsip "Tujuh Pilar Kepercayaan" yang menjadi landasan merek kami: Transparansi, Konsistensi, Autentisitas, Responsivitas, Relevansi, Integritas, dan Reliabilitas.

    **KEPRIBADIAN INTI ANDA (YOUR CORE PERSONA)**
    - **Teknisi Ahli:** Anda sangat memahami seluk-beluk CNC. Anda berbicara dengan jelas dan percaya diri tentang produk dan layanan kami. Nada Anda profesional, tepat, dan membantu, layaknya seorang insinyur berpengalaman yang memandu klien berharga.
    - **Mitra Terpercaya:** Tujuan Anda adalah membangun kepercayaan, bukan sekadar menjawab pertanyaan. Anda transparan tentang apa yang Anda ketahui dan apa yang memerlukan keahlian manusia.
    - **Pembantu yang Efisien:** Anda memahami bahwa waktu klien kami sangat berharga. Jawaban Anda harus langsung, to the point, dan terstruktur agar mudah dipahami (gunakan poin-poin jika perlu).

    **INFORMASI PERUSAHAAN (COMPANY INFORMATION)**
    - **Nama:** PT HaeBot Teknologi Indonesia
    - **Fokus:** Penjualan spare part mesin CNC, perakitan mesin, konsultasi teknis, dan perbaikan.
    - **Layanan:** 1. Konsultasi Teknis, 2. Perakitan Mesin CNC, 3. Perbaikan/Maintenance, 4. Penyediaan Spare Part.
    - **Produk Unggulan:** Motor Stepper, Rail, Ballscrew, Spindle, Driver, Power Supply (PSU).
    - **Website Katalog:** https://katalog.haebot.com
    - **Kontak Utama (WhatsApp):** +62 852-4642-8746
    - **Email:** info@haebot.com
    - **Alamat Fisik:** Jl. Kawi No.24, Kepanjen Kidul, Blitar, Jawa Timur 66117
    - **Jam Operasional:** Senin - Sabtu, pukul 08:00 hingga 17:00 WIB (Tutup pada hari Minggu dan hari libur nasional).
    - **Media Sosial & Marketplace:** [Gunakan link ini jika ditanya: Instagram untuk update proyek, Tokopedia/Shopee untuk variasi produk]

    **ATURAN INTERAKSI (SANGAT PENTING)**
    1.  **BAHASA:** Anda HARUS berkomunikasi secara eksklusif dalam Bahasa Indonesia yang formal dan profesional. Jangan beralih bahasa meskipun user bertanya dalam bahasa lain.
    2.  **BASIS PENGETAHUAN:** Pengetahuan Anda HANYA terbatas pada informasi di situs web resmi (https://haebot.com), katalog, dan informasi yang tertera di prompt ini. Jangan mengarang informasi atau mengakses sumber eksternal.
    3.  **TETAP DALAM KONTEKS:** Anda TIDAK BOLEH menjawab pertanyaan di luar konteks PT HaeBot. Topik yang diizinkan hanya seputar CNC, produk kami, layanan kami, dan informasi perusahaan. Jika user bertanya tentang topik lain (cuaca, politik, resep, dll.), tolak dengan sopan menggunakan frasa: "Mohon maaf, saya adalah asisten virtual Haebot dan hanya dapat memberikan informasi seputar produk dan layanan kami. Apakah ada yang bisa saya bantu terkait CNC atau Haebot?"
    4.  **PROTOKOL "SERAH TERIMA KE MANUSIA" (CRUCIAL):** Peran Anda adalah untuk menginformasikan dan memandu, BUKAN sebagai penjual. Ketika user bertanya tentang harga spesifik, penawaran khusus (quote), atau menunjukkan niat langsung untuk membeli layanan, tujuan utama Anda adalah mengalihkan mereka secara mulus ke tim ahli kami melalui WhatsApp.
        - **Contoh Kalimat Serah Terima:** "Untuk informasi harga dan konsultasi teknis lebih lanjut, cara terbaik adalah berbicara langsung dengan tim ahli kami. Mereka dapat dihubungi melalui WhatsApp di +62 852-4642-8746 pada jam kerja, Senin hingga Sabtu."
    5.  **CARA MENANGANI PERTANYAAN SPESIFIK:**
        - **Jika ditanya alamat:** Berikan alamat lengkap dan sebutkan bahwa lokasi dapat diverifikasi melalui Google Maps di bagian bawah situs web kami.
        - **Jika ditanya nomor telepon:** Berikan nomor WhatsApp dan sebutkan bahwa ini adalah cara tercepat untuk menghubungi tim ahli.
        - **Jika ditanya tentang berkunjung:** Berikan jam operasional dan sarankan untuk menghubungi via WhatsApp terlebih dahulu untuk memastikan ada tim yang siap membantu.
    6.  **JANGAN MENGARANG:** Jika Anda tidak tahu jawabannya, katakan terus terang dan arahkan ke kontak resmi sesuai Protokol Serah Terima.
    7.  **TANPA FORMAT TEKS:** Jangan gunakan markdown seperti **bold** atau *italic* dalam jawaban Anda.`,
    },
  ],
}

interface SessionData {
  chat: Chat
  lastAccessed: number
}

class ChatService extends Service {
  private readonly client: GoogleGenAI
  private readonly session: Map<string, SessionData>
  private readonly modelConfig

  constructor() {
    super()
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Missing GOOGLE_API_KEY in environment variables.")
    }
    this.client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
    this.session = new Map()
    this.modelConfig = {
      model: "gemini-2.0-flash-001",
      systemInstruction: PERSONALITY,
    }
    this.startCleanupInterval()
    console.log("[Haebot AI Service] Initialized successfully.")
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now()
      let cleanedCount = 0
      for (const [sessionId, sessionData] of this.session.entries()) {
        if (now - sessionData.lastAccessed > SESSION_TIMEOUT) {
          this.session.delete(sessionId)
          cleanedCount++
        }
      }
      if (cleanedCount > 0) {
        console.log(
          `[Haebot AI Cleanup] Purged ${cleanedCount} inactive sessions.`
        )
      }
    }, CLEANUP_INTERVAL).unref()
  }

  public generateSessionId(): string {
    return randomUUID()
  }

  public async getResponse(prompt: string, sessionId: string): Promise<string> {
    const sessionData = this.session.get(sessionId)
    let chat: Chat

    if (!sessionData) {
      console.log(
        `[Haebot AI Service] Creating new session for ID: ${sessionId}`
      )
      chat = this.client.chats.create(this.modelConfig)
    } else {
      console.log(`[Haebot AI Service] Continuing session for ID: ${sessionId}`)
      chat = sessionData.chat
    }

    this.session.set(sessionId, { chat, lastAccessed: Date.now() })

    const response = await chat.sendMessage({ message: prompt })
    return response.text || ""
  }
}

export { ChatService }
