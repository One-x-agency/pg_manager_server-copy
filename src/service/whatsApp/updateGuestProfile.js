const { POST } = require('./http');
const Logger = require('../../lib/logger');
const Var = require('../../config/var');

module.exports = async ({ phone, pgName, guestName, link }) => {
  const url = `https://graph.facebook.com/v20.0/${Var.whatsApp.phoneNumberId}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: 'fill_guest_profile',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: pgName },
            { type: 'text', text: guestName },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: link },
          ],
        },
      ],
    },
  };

  try {
    const response = await POST({ url, data });
    return response;
  } catch (err) {
    Logger.error(err.message || err.code, { stack: err.stack });
    return null;
  }
};
