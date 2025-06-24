require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const https = require('https');

// === Konfigurasi ===
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

const chatId = process.env.TELEGRAM_CHAT_ID;

const websites = (process.env.WEBSITES || '')
  .split(',')
  .map(item => {
    const [name, url] = item.split('|');
    return { name: name.trim(), url: url.trim() };
  })
  .filter(site => site.name && site.url);


const statusFile = 'status.json';

// === Fungsi Load & Save Status ===
function loadStatus() {
  try {
    return JSON.parse(fs.readFileSync(statusFile));
  } catch {
    return {};
  }
}

function saveStatus(data) {
  fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));
}

// === Fungsi Cek Website ===
async function checkWebsites() {
  console.log(`[INFO] Mengecek website... ${new Date().toLocaleString()}`);

  const oldStatus = loadStatus();
  const newStatus = {};
  let message = `📊 *Laporan Status Website* (${new Date().toLocaleDateString()})\n\n`;
  let hasChange = false;

  for (const site of websites) {
    let currentStatus = 'unknown';

    try {
      const res = await axios.get(site.url, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      currentStatus = (res.status >= 200 && res.status < 400) ? 'up' : 'down';
    } catch (err) {
      currentStatus = 'down';
    }

    newStatus[site.url] = currentStatus;

    // Kirim notifikasi jika status berubah
    if (oldStatus[site.url] !== currentStatus) {
      hasChange = true;
      const alertMsg = (currentStatus === 'down')
        ? `❌ *${site.name}* is *DOWN*\nURL: ${site.url}`
        : `✅ *${site.name}* is *UP*\nURL: ${site.url}`;

      await bot.sendMessage(chatId, alertMsg, { parse_mode: 'Markdown' });
      console.log(`[ALERT] ${site.name}: ${currentStatus.toUpperCase()}`);
    }

    // Tambahkan ke laporan harian
    const symbol = currentStatus === 'up' ? '✅' : '❌';
    message += `${symbol} *${site.name}*\n${site.url}\n\n`;
  }

  saveStatus(newStatus);

  // Kirim laporan harian jika tidak ada perubahan
  if (!hasChange) {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('[INFO] Laporan harian dikirim.');
  }
}

// === Cron Job: Setiap hari jam 08:00 WIB ===
// cron.schedule('0 8 * * *', () => {
//   checkWebsites();
// });

// === Jalankan Manual Saat File Dieksekusi ===
checkWebsites().then(() => process.exit(0));

