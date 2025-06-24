# 🤖 BotChecker

BotChecker adalah bot otomatis berbasis Node.js untuk:
- Mengecek status website (`up` atau `down`)
- Mengirim laporan ke Telegram setiap hari
- Mengirim notifikasi bila status website berubah
- (Opsional) Mendukung fitur screenshot halaman web

---

## 🚀 Fitur

- ✅ Cek banyak website sekaligus
- ✅ Kirim laporan status harian ke Telegram
- ✅ Deteksi perubahan status secara real-time
- ⚠️ Peringatan bila ada website yang down
- 📸 (Opsional) Screenshot website

---

# ENV

# Token bot dari BotFather
TELEGRAM_TOKEN=123456789:ABCdEfGhIjKlMnOpQRsTUVwxyZ

# ID chat grup atau user (bisa negatif jika grup)
TELEGRAM_CHAT_ID=-1001234567890

# URL tambahan untuk bot screenshot (jika dipakai fitur screenshot)
URL=https://example.com/screenshoot

# Website yang akan dicek statusnya (format: Nama|URL), dipisah koma
WEBSITES=Web 1|https://example1.com/,Web 2|https://example2.com/

---

## 📦 Instalasi

```bash
git clone https://github.com/namamu/BotChecker.git
cd BotChecker
npm install









