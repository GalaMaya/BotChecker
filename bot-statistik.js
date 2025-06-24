const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const mainChatId = process.env.TELEGRAM_CHAT_ID;
const adminChatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token);

// Fungsi screenshot card-body berdasarkan judul
async function screenshotCardByTitle(page, titleText, filename) {
  await page.waitForSelector('div.card');

  const cards = await page.$$('div.card');

  for (const card of cards) {
    const header = await card.$('div.card-header > h4');
    if (!header) continue;

    const rawTitle = await page.evaluate(el => el.textContent.trim().replace(/\s+/g, ' '), header);

    if (rawTitle.startsWith(titleText)) {
      await card.screenshot({ path: filename });
      return true;
    }
  }

  return false;
}



// Fungsi utama
async function sendScreenshot() {
  const url = process.env.URL;
  const timestamp = Date.now();

  const filenames = {
    weekly: `weekly-users-${timestamp}.png`,
    versions: `app-versions-${timestamp}.png`,
    genders: `genders-${timestamp}.png`,
    years: `years-${timestamp}.png`,
  };

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const gotWeekly = await screenshotCardByTitle(page, 'Weekly Registered Users', filenames.weekly);
    const gotVersion = await screenshotCardByTitle(page, 'Statistics App Versions', filenames.versions);
    const gotGender = await screenshotCardByTitle(page, 'Statistics Genders', filenames.genders);
    const gotYear = await screenshotCardByTitle(page, 'Statistics Years', filenames.years);

    await browser.close();

    const failed = [];
    if (!gotWeekly) failed.push('Weekly Registered Users');
    if (!gotVersion) failed.push('Statistics App Versions');
    if (!gotGender) failed.push('Statistics Genders');
    if (!gotYear) failed.push('Statistics Years');

    if (failed.length > 0) {
      throw new Error(`❌ Gagal menemukan grafik: ${failed.join(', ')}`);
    }

    await bot.sendPhoto(mainChatId, fs.createReadStream(filenames.weekly), {
      caption: '📈 *Weekly Registered Users*',
      parse_mode: 'Markdown'
    });

    await bot.sendPhoto(mainChatId, fs.createReadStream(filenames.versions), {
      caption: '📊 *Statistics App Versions*',
      parse_mode: 'Markdown'
    });

    await bot.sendPhoto(mainChatId, fs.createReadStream(filenames.genders), {
      caption: '🚻 *Statistics Genders*',
      parse_mode: 'Markdown'
    });

    await bot.sendPhoto(mainChatId, fs.createReadStream(filenames.years), {
      caption: '📆 *Statistics Years*',
      parse_mode: 'Markdown'
    });

    // Bersihkan file lokal
    Object.values(filenames).forEach(f => fs.unlinkSync(f));

    console.log(`[OK] Semua screenshot berhasil dikirim - ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('[ERROR]', error.message);

    await bot.sendMessage(adminChatId, `⚠️ *PERINGATAN BOT*\nGagal kirim screenshot \n\n*Error:* ${error.message}`, {
      parse_mode: 'Markdown'
    });
  }
}

// CRON: Setiap hari jam 08:00
// cron.schedule('0 8 * * *', () => {
//   console.log(`[CRON] Kirim screenshot dimulai - ${new Date().toLocaleString()}`);
//   sendScreenshot();
// });

// Uncomment ini untuk test manual
sendScreenshot();
