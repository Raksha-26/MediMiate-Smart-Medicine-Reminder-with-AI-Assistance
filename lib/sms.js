// You'll need to install the Vonage SDK: npm install @vonage/server-sdk
import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

export async function sendSMS(to, text) {
  try {
    const from = "MediMeet";
    const response = await vonage.sms.send({
      to,
      from,
      text
    });

    if (response.messages[0].status === '0') {
      return { success: true };
    } else {
      console.error('SMS sending failed:', response.messages[0]['error-text']);
      return { success: false, error: response.messages[0]['error-text'] };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}