/**
 * SMS Service Utility
 * Supports real-time SMS delivery via Twilio, Fast2SMS, 2Factor, or Textbelt APIs
 * with automatic fallback to high-visibility terminal logs & real-time notification responses.
 */

const sendSmsOtp = async (phone, otp) => {
  const cleanPhone = phone ? phone.toString().trim().replace(/[-+ ]/g, '') : '';
  
  console.log(`\n======================================================`);
  console.log(`[REAL-TIME OTP SERVICE] Dispatching OTP: ${otp} to Phone: ${cleanPhone}`);
  console.log(`======================================================\n`);

  let sent = false;
  let providerUsed = 'Dev Real-Time Console / UI Notification';

  // 1. Attempt Twilio SMS Gateway (if credentials exist)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : (cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`);
      const bodyParams = new URLSearchParams({
        To: formattedPhone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your Mahaveer Smart Furniture Hub verification OTP is ${otp}. Valid for 10 minutes.`
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      if (response.ok) {
        sent = true;
        providerUsed = 'Twilio SMS Gateway';
        console.log(`[SMS SUCCESS] OTP sent via Twilio to ${formattedPhone}`);
      } else {
        const errorRes = await response.json();
        console.warn(`[SMS WARNING] Twilio returned error:`, errorRes.message || errorRes);
      }
    } catch (err) {
      console.warn(`[SMS ERROR] Twilio dispatch failed:`, err.message);
    }
  }

  // 2. Attempt Fast2SMS Gateway (popular Indian SMS route)
  if (!sent && process.env.FAST2SMS_API_KEY) {
    try {
      const tenDigit = cleanPhone.slice(-10);
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${tenDigit}`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      if (data && data.return) {
        sent = true;
        providerUsed = 'Fast2SMS Gateway';
        console.log(`[SMS SUCCESS] OTP sent via Fast2SMS to ${tenDigit}`);
      } else {
        console.warn(`[SMS WARNING] Fast2SMS error:`, data);
      }
    } catch (err) {
      console.warn(`[SMS ERROR] Fast2SMS dispatch failed:`, err.message);
    }
  }

  // 3. Attempt 2Factor API Gateway
  if (!sent && process.env.TWO_FACTOR_API_KEY) {
    try {
      const tenDigit = cleanPhone.slice(-10);
      const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${tenDigit}/${otp}/OTP1`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      if (data && data.Status === 'Success') {
        sent = true;
        providerUsed = '2Factor SMS Gateway';
        console.log(`[SMS SUCCESS] OTP sent via 2Factor to ${tenDigit}`);
      } else {
        console.warn(`[SMS WARNING] 2Factor API error:`, data);
      }
    } catch (err) {
      console.warn(`[SMS ERROR] 2Factor dispatch failed:`, err.message);
    }
  }

  // 4. Attempt Textbelt API Gateway (Free tier fallback)
  if (!sent && process.env.ENABLE_TEXTBELT_SMS === 'true') {
    try {
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone;
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          message: `Your Mahaveer Smart Furniture Hub verification OTP is ${otp}.`,
          key: process.env.TEXTBELT_API_KEY || 'textbelt'
        })
      });
      const data = await response.json();
      if (data && data.success) {
        sent = true;
        providerUsed = 'Textbelt SMS Gateway';
        console.log(`[SMS SUCCESS] OTP sent via Textbelt to ${formattedPhone}`);
      } else {
        console.warn(`[SMS WARNING] Textbelt error:`, data.error);
      }
    } catch (err) {
      console.warn(`[SMS ERROR] Textbelt dispatch failed:`, err.message);
    }
  }

  return { sent, providerUsed };
};

module.exports = { sendSmsOtp };
