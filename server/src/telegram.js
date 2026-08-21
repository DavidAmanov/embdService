const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * Sends a photo with a caption to a Telegram chat via the Bot API.
 * @param {string} botToken
 * @param {string} chatId
 * @param {Buffer} photoBuffer
 * @param {string} caption
 */
async function sendPhoto(botToken, chatId, photoBuffer, caption) {
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  form.append('photo', new Blob([photoBuffer], { type: 'image/png' }), 'design.png');

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendPhoto`, {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram API error: ${data.description || response.statusText}`);
  }
  return data;
}

module.exports = { sendPhoto };
