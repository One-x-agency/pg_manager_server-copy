const { POST } = require('./http');
const Var = require('../../config/var');
const Logger = require('../../lib/logger');

module.exports = async ({ phone, OTP }) => {
  const url = `https://graph.facebook.com/v20.0/${Var.whatsApp.phoneNumberId}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: 'otp',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: OTP.toString() },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: OTP.toString() },
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
