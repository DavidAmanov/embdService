require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sendPhoto } = require('./telegram');

const PORT = process.env.PORT || 4000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
  console.error(
    'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID in environment. See server/.env.example.',
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

app.post('/api/order', async (req, res) => {
  const { name, contact, sizeLabel, imageBase64 } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Укажите имя.' });
  }
  if (!contact || typeof contact !== 'string' || !contact.trim()) {
    return res.status(400).json({ error: 'Укажите контакт для связи.' });
  }
  if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Отсутствует изображение дизайна.' });
  }

  const photoBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

  const caption = [
    '<b>Новый заказ ремувки</b>',
    sizeLabel ? `Размер: ${escapeHtml(sizeLabel)}` : null,
    `Имя: ${escapeHtml(name.trim())}`,
    `Контакт: ${escapeHtml(contact.trim())}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await sendPhoto(BOT_TOKEN, ADMIN_CHAT_ID, photoBuffer, caption);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send order to Telegram:', err);
    res.status(502).json({ error: 'Не удалось отправить заказ. Попробуйте позже.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Order server listening on port ${PORT}`);
});
