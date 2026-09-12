import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

// Read configuration prioritizing .env, then .env.example (user-provided values), then process.env
function getActiveEnv(key: string): string {
  if (process.env[key] && process.env[key]!.trim()) {
    return process.env[key]!.trim();
  }
  if (fs.existsSync('.env')) {
    try {
      const content = fs.readFileSync('.env', 'utf-8');
      const match = content.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\r\n]+)["']?`, 'm'));
      if (match && match[1]?.trim()) return match[1].trim();
    } catch {}
  }
  if (fs.existsSync('.env.example')) {
    try {
      const content = fs.readFileSync('.env.example', 'utf-8');
      const match = content.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\r\n]+)["']?`, 'm'));
      if (match && match[1]?.trim() && !match[1].startsWith('MY_')) return match[1].trim();
    } catch {}
  }
  if (process.env[key] && process.env[key]!.trim()) {
    return process.env[key]!.trim();
  }
  return '';
}

// In-memory OTP storage mapping email -> OTP record
interface StoredOtp {
  code: string;
  expiresAt: number; // Unix timestamp in ms (10 minutes limit)
  purpose: string;
  attempts: number;
  createdAt: number;
}

const otpStore = new Map<string, StoredOtp>();

// Periodic cleanup of expired OTPs every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 2 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Helper to create Nodemailer Gmail transport
  const getGmailTransporter = () => {
    const user = (getActiveEnv('GMAIL_USER') || getActiveEnv('GMAIL_EMAIL') || 'haswanth944@gmail.com').trim().replace(/^["']|["']$/g, '');
    const pass = (getActiveEnv('GMAIL_APP_PASSWORD') || getActiveEnv('GMAIL_PASS') || getActiveEnv('GMAIL_PASSWORD') || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

    if (!user || !pass) {
      return { transporter: null, user, passConfigured: false };
    }

    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:465,
      secure:true,
      auth: {
        user,
        pass,
      },
    });

    return { transporter, user, passConfigured: true };
  };

  // API Route: Check Email Dispatch Provider Status (Gmail via Nodemailer)
  app.get('/api/email-status', (req, res) => {
    const { user, passConfigured } = getGmailTransporter();

    res.json({
      configured: passConfigured,
      provider: 'Gmail',
      sender: `ProcureEase <${user}>`,
      activeOtpsCount: otpStore.size,
      notice: passConfigured 
        ? `Gmail SMTP is configured with ${user} and ready to dispatch OTP emails directly.` 
        : `Gmail dispatch is configured for ${user}. Please configure GMAIL_APP_PASSWORD (16-character Google App Password) in environment variables for live inbox delivery.`
    });
  });

  // API Route: Dispatch Email OTP (Gmail via Nodemailer)
  // Generates a 6-digit code, stores it with 10 minutes expiration, and emails it via Gmail
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email, purpose, otp: clientOtp } = req.body;

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid email address is required' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Generate 6-digit code (or use client provided 6-digit code if present)
      const otp = (typeof clientOtp === 'string' && /^\d{6}$/.test(clientOtp.trim()))
        ? clientOtp.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();

      // Store with expiration timestamp (10 minutes)
      const expiresAtMs = Date.now() + 10 * 60 * 1000;
      otpStore.set(normalizedEmail, {
        code: otp,
        expiresAt: expiresAtMs,
        purpose: purpose || 'user_signup',
        attempts: 0,
        createdAt: Date.now()
      });

      const purposeTitle = purpose === 'staff_login' 
        ? 'Staff Two-Factor Authentication (2FA)' 
        : purpose === 'user_login'
        ? 'Farmer / Citizen Login OTP Verification'
        : purpose === 'admin_login'
        ? 'Apex Administrator Security OTP Verification'
        : purpose === 'staff_signup'
        ? 'Official APMC Staff Registration Verification'
        : 'Farmer / Citizen Registration Verification';

      const subject = `[ProcureEase] Your Security Code: ${otp}`;
      
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
            .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { background: #065f46; color: #ffffff; padding: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; letter-spacing: -0.5px; }
            .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.85; }
            .content { padding: 28px 24px; color: #1e293b; }
            .title { font-size: 15px; font-weight: bold; margin-bottom: 12px; }
            .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
            .otp-code { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #065f46; }
            .expiry { font-size: 12px; color: #64748b; margin-top: 8px; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>ProcureEase Agricultural Portal</h1>
              <p>Government of Andhra Pradesh • APMC Procurement System</p>
            </div>
            <div class="content">
              <div class="title">${purposeTitle}</div>
              <p style="font-size: 13px; line-height: 1.5; color: #475569;">
                A request was made to authenticate your account with email address <strong>${normalizedEmail}</strong>. 
                Please use the one-time security code below to complete verification:
              </p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="expiry">Expires in 10 minutes • Do not share this code with anyone</div>
              </div>
              <p style="font-size: 12px; line-height: 1.4; color: #64748b;">
                If you did not request this code, please ignore this email or notify your system administrator immediately.
              </p>
            </div>
            <div class="footer">
              This is an automated notification from ProcureEase APMC Portal. Sent via Gmail. Please do not reply directly to this email.
            </div>
          </div>
        </body>
        </html>
      `;

      const textBody = `[ProcureEase] Security Code: ${otp}\n\nPurpose: ${purposeTitle}\nEmail: ${normalizedEmail}\n\nYour 6-digit verification code is: ${otp}\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`;

      // Dispatch via Gmail SMTP (Nodemailer)
      const { transporter, user: gmailSender, passConfigured } = getGmailTransporter();

      let emailDelivered = false;
      let deliveryNotice = '';
      let deliveryError = '';
      let messageId = '';

      if (transporter && passConfigured) {
        try {
          const info = await transporter.sendMail({
            from: `"ProcureEase APMC Portal" <${gmailSender}>`,
            to: normalizedEmail,
            subject,
            text: textBody,
            html: htmlBody,
          });

          emailDelivered = true;
          messageId = info.messageId || '';
          deliveryNotice = `Verification code dispatched to ${normalizedEmail} via Gmail (${gmailSender}).`;
          console.log(`[Gmail Dispatch] Successfully sent OTP to ${normalizedEmail} via Gmail. Message ID: ${info.messageId}`);
        } catch (mailErr: unknown) {
          const error = mailErr as { message?: string; code?: string; response?: string };
          const errorMsg = error.message || '';
          const is535Auth = errorMsg.includes('535') || error.code === 'EAUTH' || error.response?.includes('535');

          if (is535Auth) {
            console.warn(`[Gmail Dispatch] Google SMTP Authentication Notice: Gmail rejected credentials for ${gmailSender} (535-5.7.8 Bad Credentials).`);
            deliveryError = 'Gmail SMTP Authentication Failed (535-5.7.8 Bad Credentials). Google revoked or rejected the App Password. Please generate a fresh 16-character App Password at https://myaccount.google.com/apppasswords and update GMAIL_APP_PASSWORD in Settings.';
          } else {
            console.warn('[Gmail Dispatch] SMTP dispatch notice:', errorMsg || error);
            deliveryError = errorMsg || 'Failed to dispatch email via Gmail SMTP';
          }
          deliveryNotice = deliveryError;
        }
      } else {
        console.warn(`[Gmail Dispatch] GMAIL_APP_PASSWORD is not configured for ${gmailSender}.`);
        deliveryNotice = `Gmail is configured for ${gmailSender}. Please set GMAIL_APP_PASSWORD in Settings for live inbox delivery.`;
        deliveryError = deliveryNotice;
      }

      if (emailDelivered) {
        return res.json({ 
          success: true, 
          emailDelivered: true, 
          provider: 'Gmail',
          sender: gmailSender,
          expiresAt: new Date(expiresAtMs).toISOString(),
          messageId,
          message: `Verification code sent to ${normalizedEmail}. Please check your email inbox.` 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          emailDelivered: false, 
          provider: 'Gmail',
          sender: gmailSender,
          error: deliveryError || 'Failed to dispatch email via Gmail SMTP.',
          message: `Could not send verification email to ${normalizedEmail}: ${deliveryError || 'Gmail SMTP error'}`
        });
      }

    } catch (err: unknown) {
      const error = err as { message?: string };
      console.warn('[Gmail Dispatch] Server request error:', error.message || error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to dispatch email' });
    }
  });

  // API Route: Verify OTP endpoint
  // Validates the code against the stored value before allowing account creation
  app.post('/api/verify-otp', async (req, res) => {
    try {
      const { email, otp, purpose } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: 'Email and 6-digit verification code are required.' 
        });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const enteredCode = String(otp).trim();

      if (enteredCode.length !== 6 || !/^\d{6}$/.test(enteredCode)) {
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: 'Please provide a valid 6-digit verification code.' 
        });
      }

      const record = otpStore.get(normalizedEmail);

      // Check if an active OTP was issued for this email
      if (!record) {
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: 'No active OTP verification session found for this email. Please request a new code.' 
        });
      }

      // Check 10-minute expiration
      if (Date.now() > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: 'This verification code has expired (10 minutes limit). Please request a new OTP.' 
        });
      }

      // Check security attempts limit (max 5)
      if (record.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: 'Too many incorrect attempts. For security reasons, please request a new verification code.' 
        });
      }

      // Validate purpose if supplied
      if (purpose && record.purpose && record.purpose !== purpose) {
        return res.status(400).json({
          valid: false,
          success: false,
          error: 'Verification purpose mismatch. Please request a new code.'
        });
      }

      // Validate code against stored value
      if (record.code !== enteredCode) {
        record.attempts += 1;
        const remaining = 5 - record.attempts;
        return res.status(400).json({ 
          valid: false, 
          success: false, 
          error: `Incorrect verification code. ${remaining} attempt(s) remaining.` 
        });
      }

      // Success: Consume OTP so it cannot be re-used
      otpStore.delete(normalizedEmail);

      console.log(`[OTP Verification] Successfully validated OTP for ${normalizedEmail}. Account creation permitted.`);

      return res.status(200).json({ 
        valid: true, 
        success: true, 
        message: 'OTP verified successfully. Account creation permitted.' 
      });

    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('[Verify OTP] Unexpected server error:', error);
      return res.status(500).json({ 
        valid: false, 
        success: false, 
        error: error.message || 'Internal server error during OTP verification' 
      });
    }
  });

  // Lazy GenAI Client Initializer
  let aiClient: GoogleGenAI | null = null;
  const getGenAI = (): GoogleGenAI | null => {
    const key = (process.env.GEMINI_API_KEY || getActiveEnv('GEMINI_API_KEY') || '').trim();
    if (!key) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
  };

  // Robust Heuristic Parser for Spoken Farmer Details (Telugu, Hindi, English)
  const parseSpokenDetailsHeuristically = (transcript: string, language: string = 'te') => {
    const text = transcript.toLowerCase();

    // 1. Detect Crop
    let crop = 'Paddy (Grade-A)';
    let cropId = 'paddy';
    if (text.includes('వరి') || text.includes('ధాన్యం') || text.includes('వడ్లు') || text.includes('paddy') || text.includes('dhan') || text.includes('rice')) {
      crop = 'Paddy (Grade-A)';
      cropId = 'paddy';
    } else if (text.includes('గోధుమ') || text.includes('గోధుమలు') || text.includes('wheat') || text.includes('gehun') || text.includes('gehu')) {
      crop = 'Wheat';
      cropId = 'wheat';
    } else if (text.includes('మొక్కజొన్న') || text.includes('మొక్క జొన్న') || text.includes('జాన్న') || text.includes('maize') || text.includes('corn') || text.includes('makka')) {
      crop = 'Maize (Corn)';
      cropId = 'maize';
    } else if (text.includes('పత్తి') || text.includes('దూది') || text.includes('cotton') || text.includes('kapas')) {
      crop = 'Cotton (Medium Staple)';
      cropId = 'cotton';
    } else if (text.includes('వేరుశనగ') || text.includes('పల్లీ') || text.includes('groundnut') || text.includes('peanut') || text.includes('moongphali')) {
      crop = 'Groundnut (in shell)';
      cropId = 'groundnut';
    }

    // 2. Detect Quantity (Quintals or Bags)
    let quantityQuintals = 25;
    // Look for numbers before quintal/bags
    const numberMatch = text.match(/(\d+)\s*(క్వింటా|క్వింటాళ్లు|క్వింటాలు|క్వింటాళ్ళ|quintal|quintals|qtl|బస్తా|బస్తాలు|బస్తాల|బోరి|bags|bag)/i)
      || text.match(/(క్వింటా|బస్తా|bags|quintals)\s*(\d+)/i)
      || text.match(/\b(\d{1,3})\b/);

    if (numberMatch) {
      const val = parseInt(numberMatch[1] || numberMatch[2], 10);
      if (!isNaN(val) && val > 0 && val <= 500) {
        if (text.includes('బస్తా') || text.includes('bag') || text.includes('బోరి')) {
          // In AP/Telangana, 1 bag of paddy is typically 50kg to 75kg; if they say 50 bags, ~25-50 quintals. Let's provide natural quintal equivalent or raw bags
          quantityQuintals = Math.max(5, Math.round(val * 0.5));
        } else {
          quantityQuintals = val;
        }
      }
    }

    // 3. Detect Centre
    let centreName = 'Mylavaram Procurement Centre';
    let centreId = 'centre-1';
    if (text.includes('గొల్లపూడి') || text.includes('gollapudi')) {
      centreName = 'Gollapudi Procurement Centre';
      centreId = 'centre-2';
    } else if (text.includes('విజయవాడ') || text.includes('vijayawada') || text.includes('భవానిపురం')) {
      centreName = 'Vijayawada Central APMC Yard';
      centreId = 'centre-3';
    } else if (text.includes('ఇబ్రహీంపట్నం') || text.includes('ఇబ్రహీం') || text.includes('ibrahimpatnam')) {
      centreName = 'Ibrahimpatnam Grain Terminal';
      centreId = 'centre-4';
    } else if (text.includes('తిరువూరు') || text.includes('tiruvuru')) {
      centreName = 'Tiruvuru Procurement Hub';
      centreId = 'centre-5';
    } else if (text.includes('నూజివీడు') || text.includes('nuzvid')) {
      centreName = 'Nuzvid APMC Depot';
      centreId = 'centre-6';
    }

    // 4. Detect Phone Number (10 digits)
    let mobileNumber = '';
    const phoneMatch = text.match(/\b([6-9]\d{9})\b/);
    if (phoneMatch) {
      mobileNumber = phoneMatch[1];
    }

    // 5. Detect Farmer Name
    let farmerName = '';
    const nameMatch = text.match(/(?:నా పేరు|పేరు|name is|naam)\s+([a-zA-Z\u0C00-\u0C7F]+)/i);
    if (nameMatch && nameMatch[1]) {
      farmerName = nameMatch[1].trim();
    }

    // 6. Time & Date
    const preferredDate = '13 September 2026';
    let preferredTime = '10:30 AM - 11:00 AM';
    if (text.includes('మధ్యాహ్నం') || text.includes('afternoon') || text.includes('dopahar')) {
      preferredTime = '02:00 PM - 02:30 PM';
    } else if (text.includes('ఉదయం') || text.includes('పొద్దున') || text.includes('morning') || text.includes('subah')) {
      preferredTime = '09:30 AM - 10:00 AM';
    }

    // 7. Telugu & English spoken response
    let audioFeedback = '';
    if (language === 'te' || /[\u0C00-\u0C7F]/.test(transcript)) {
      audioFeedback = `మీరు ${crop} ${quantityQuintals} క్వింటాళ్లు ${centreName} వద్ద బుక్ చేయాలనుకుంటున్నారు. నిర్ధారించడానికి హా అని చెప్పండి లేదా బటన్ నొక్కండి.`;
    } else if (language === 'hi' || /[\u0900-\u097F]/.test(transcript)) {
      audioFeedback = `आप ${crop} के लिए ${quantityQuintals} क्विंटल ${centreName} पर बुक करना चाहते हैं। पुष्टि के लिए बटन दबाएं।`;
    } else {
      audioFeedback = `Booking recognized: ${quantityQuintals} quintals of ${crop} at ${centreName}. Tap confirm to issue token.`;
    }

    return {
      crop,
      cropId,
      quantityQuintals,
      centreName,
      centreId,
      farmerName: farmerName || 'Farmer (రైతు)',
      mobileNumber: mobileNumber || '9848012345',
      date: preferredDate,
      timeSlot: preferredTime,
      audioFeedback,
      confidence: 'high'
    };
  };

  // API Route: Voice Token Assistant parser powered by Gemini 3.8 Flash with local fallback
  app.post('/api/parse-voice-token', async (req, res) => {
    try {
      const { transcript, language = 'te' } = req.body;

      if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
        return res.status(400).json({ success: false, error: 'Voice transcript is required' });
      }

      const cleanTranscript = transcript.trim();
      const heuristicResult = parseSpokenDetailsHeuristically(cleanTranscript, language);

      const ai = getGenAI();
      if (ai) {
        try {
          const prompt = `You are an AI assistant for illiterate rural Indian farmers using a government grain procurement platform (ProcureEase).
The farmer spoke into a microphone to book a procurement slot token. Their spoken transcript is:
"${cleanTranscript}"

Language preference: ${language}.
Crops available: "Paddy (Grade-A)", "Wheat", "Maize (Corn)", "Cotton (Medium Staple)", "Groundnut (in shell)".
Procurement Centres available: "Mylavaram Procurement Centre", "Gollapudi Procurement Centre", "Vijayawada Central APMC Yard", "Ibrahimpatnam Grain Terminal".

Extract and normalize the booking information from the farmer's spoken speech:
1. crop: One of the available crops above (default to "Paddy (Grade-A)" if unclear or if mentions వరి/వరిధాన్యం/धान)
2. cropId: 'paddy' | 'wheat' | 'maize' | 'cotton' | 'groundnut'
3. quantityQuintals: integer number of quintals (convert bags to quintals if mentioned, e.g. 50 bags = 25 quintals; default 25)
4. centreName: matched centre name from the available list (default "Mylavaram Procurement Centre")
5. centreId: 'centre-1' for Mylavaram, 'centre-2' for Gollapudi, 'centre-3' for Vijayawada, 'centre-4' for Ibrahimpatnam
6. farmerName: extracted spoken name, or "రైతు (Farmer)" if not mentioned
7. mobileNumber: 10-digit mobile number if spoken, or empty string
8. date: standard slot date (e.g. "13 September 2026")
9. timeSlot: standard time slot (e.g. "10:30 AM - 11:00 AM")
10. audioFeedback: A short, gentle, clear sentence spoken in Telugu (or farmer's language) summarizing the booking and asking for confirmation.

Return purely a JSON object with these keys.`;

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI parsing timeout')), 3500)
          );

          const aiPromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const aiResponse: any = await Promise.race([aiPromise, timeoutPromise]);

          const rawText = aiResponse.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              data: {
                ...heuristicResult,
                ...parsed,
                rawTranscript: cleanTranscript
              },
              source: 'gemini'
            });
          }
        } catch (aiErr) {
          console.warn('[Gemini Voice Parse] Notice, falling back to heuristic parser:', aiErr);
        }
      }

      // Return heuristic result if Gemini key absent or on failure
      return res.json({
        success: true,
        data: {
          ...heuristicResult,
          rawTranscript: cleanTranscript
        },
        source: 'heuristic'
      });

    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('[Voice Token Parse] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to process voice token' });
    }
  });

  // Step-by-Step Farmer Voice Signup AI Parser
  app.post('/api/parse-voice-signup-step', async (req, res) => {
    try {
      const { step, transcript, language = 'te' } = req.body;
      const cleanTranscript = (transcript || '').trim();

      if (!cleanTranscript) {
        return res.json({
          success: false,
          error: 'No spoken words detected.'
        });
      }

      // 1. Local Heuristic Parse for each step
      let heuristicResult: any = {};
      const wordsToDigits = (str: string): string => {
        let result = str.toLowerCase();
        // Telugu digit words
        result = result.replace(/సున్నా/g, '0').replace(/ఒకటి/g, '1').replace(/రెండు/g, '2')
          .replace(/మూడు/g, '3').replace(/నాలుగు/g, '4').replace(/ఐదు|అయిదు/g, '5')
          .replace(/ఆరు/g, '6').replace(/ఏడు/g, '7').replace(/ఎనిమిది/g, '8').replace(/తొమ్మిది/g, '9');
        // Hindi digit words
        result = result.replace(/शून्य/g, '0').replace(/एक/g, '1').replace(/दो/g, '2')
          .replace(/तीन/g, '3').replace(/चार/g, '4').replace(/पाँच|पांच/g, '5')
          .replace(/छह|छ:/g, '6').replace(/सात/g, '7').replace(/आठ/g, '8').replace(/नौ/g, '9');
        // English digit words
        result = result.replace(/\bzero\b/gi, '0').replace(/\bone\b/gi, '1').replace(/\btwo\b/gi, '2')
          .replace(/\bthree\b/gi, '3').replace(/\bfour\b/gi, '4').replace(/\bfive\b/gi, '5')
          .replace(/\bsix\b/gi, '6').replace(/\bseven\b/gi, '7').replace(/\beight\b/gi, '8').replace(/\bnine\b/gi, '9');
        return result.replace(/\D/g, '');
      };

      if (step === 'name') {
        let cleanName = cleanTranscript
          .replace(/^(నా పేరు|నా పేరండి|నా పేరు వచ్చేసి|మా పేరు|పేరు|నాది|నేను|మై నేమ్ ఈజ్|మై నేమ్|మై సెల్ఫ్)/gi, '')
          .replace(/^(my name is|i am|myself|this is|name is|naam|mera naam)/gi, '')
          .replace(/[.,!]/g, '')
          .trim();
        if (!cleanName) cleanName = cleanTranscript;
        heuristicResult = {
          name: cleanName,
          audioFeedback: language === 'te' 
            ? `${cleanName} గారు, మీ పేరు నమోదు చేశాము.` 
            : language === 'hi' 
            ? `${cleanName} जी, आपका नाम दर्ज कर लिया गया है।`
            : `Recorded your name as ${cleanName}.`
        };
      } else if (step === 'mobile') {
        const digits = wordsToDigits(cleanTranscript);
        const mobile = digits.length >= 10 ? digits.slice(-10) : digits;
        const valid = mobile.length === 10;
        heuristicResult = {
          mobile,
          valid,
          audioFeedback: valid
            ? (language === 'te' 
                ? `మీ మొబైల్ నంబర్ ${mobile} నమోదు చేశాము.` 
                : language === 'hi' 
                ? `आपका मोबाइल नंबर ${mobile} दर्ज हो गया है।` 
                : `Recorded mobile number ${mobile}.`)
            : (language === 'te' 
                ? `దయచేసి 10 అంకెల మొబైల్ నంబర్ చెప్పండి.` 
                : `Please provide a 10-digit mobile number.`)
        };
      } else if (step === 'location') {
        let village = 'Velvadam';
        let mandal = 'Mylavaram';
        let district = 'NTR District';
        let state = 'Andhra Pradesh';

        const tLower = cleanTranscript.toLowerCase();
        if (tLower.includes('గొల్లపూడి') || tLower.includes('gollapudi')) {
          village = 'Gollapudi'; mandal = 'Vijayawada Rural';
        } else if (tLower.includes('తిరువూరు') || tLower.includes('tiruvuru')) {
          village = 'Tiruvuru'; mandal = 'Tiruvuru';
        } else if (tLower.includes('నందిగామ') || tLower.includes('nandigama')) {
          village = 'Nandigama'; mandal = 'Nandigama';
        } else if (tLower.includes('జగ్గయ్యపేట') || tLower.includes('jaggayyapeta')) {
          village = 'Jaggayyapeta'; mandal = 'Jaggayyapeta';
        } else if (tLower.includes('మైలవరం') || tLower.includes('mylavaram')) {
          village = 'Mylavaram'; mandal = 'Mylavaram';
        } else if (tLower.includes('వెల్వదం') || tLower.includes('velvadam')) {
          village = 'Velvadam'; mandal = 'Mylavaram';
        } else {
          // Extract first word/words as village
          const parts = cleanTranscript.split(/[, ]+/).filter(Boolean);
          if (parts.length > 0) village = parts[0];
          if (parts.length > 1) mandal = parts[1];
        }

        heuristicResult = {
          village,
          mandal,
          district,
          state,
          audioFeedback: language === 'te'
            ? `గ్రామం ${village}, మండలం ${mandal} గా నమోదు చేశాము.`
            : `Recorded village ${village} and mandal ${mandal}.`
        };
      } else if (step === 'cropAndLand') {
        let crop = 'Paddy (Grade-A)';
        const tLower = cleanTranscript.toLowerCase();
        if (tLower.includes('మొక్కజొన్న') || tLower.includes('maize') || tLower.includes('జొన్న')) crop = 'Maize';
        else if (tLower.includes('పత్తి') || tLower.includes('cotton')) crop = 'Cotton';
        else if (tLower.includes('వేరుశెనగ') || tLower.includes('groundnut')) crop = 'Groundnut';
        else if (tLower.includes('గోధుమ') || tLower.includes('wheat')) crop = 'Wheat';

        // Extract acres
        let acres = '5.0';
        const acreMatch = cleanTranscript.match(/(\d+(\.\d+)?)\s*(ఎకరాలు|ఎకరాల|ఎకరం|acres?|acre)/i) || cleanTranscript.match(/\d+(\.\d+)?/);
        if (acreMatch) acres = acreMatch[1] || acreMatch[0];

        const farmerId = `AP/NTR/2026/${Math.floor(1000 + Math.random() * 9000)}`;

        heuristicResult = {
          crop,
          landDetails: acres,
          farmerId,
          audioFeedback: language === 'te'
            ? `ప్రధాన పంట ${crop}, ${acres} ఎకరాల భూమి నమోదు చేశాము.`
            : `Recorded primary crop as ${crop} across ${acres} acres.`
        };
      } else if (step === 'credentials') {
        const digits = wordsToDigits(cleanTranscript);
        const pin = digits.length >= 6 ? digits.slice(0, 6) : (cleanTranscript.replace(/\s+/g, '') || '123456');
        heuristicResult = {
          password: pin.length >= 6 ? pin : pin.padEnd(6, '0'),
          audioFeedback: language === 'te'
            ? `మీ ఖాతా పాస్‌వర్డ్ సెట్ చేయబడింది.`
            : `Account password has been set securely.`
        };
      }

      // 2. Enhance with Gemini if available
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

          const prompt = `You are an AI assistant helping rural and illiterate Indian farmers register their APMC procurement account via voice.
The current registration step is: "${step}".
The farmer's spoken transcript is: "${cleanTranscript}".
Preferred language: "${language}".

Extract relevant fields strictly as a JSON object depending on step:
If step == 'name':
{
  "name": "Clean farmer full name without honorifics or introductory phrases (e.g. 'Ramesh Kumar' or 'లక్ష్మయ్య')",
  "audioFeedback": "Short pleasant Telugu or selected language acknowledgment confirming the name"
}
If step == 'mobile':
{
  "mobile": "10-digit mobile number string extracted from spoken digits",
  "valid": true or false,
  "audioFeedback": "Short pleasant spoken confirmation"
}
If step == 'location':
{
  "village": "Village name",
  "mandal": "Mandal or Taluk name",
  "district": "District name (default NTR District)",
  "state": "State name (default Andhra Pradesh)",
  "audioFeedback": "Short spoken confirmation in Telugu or selected language"
}
If step == 'cropAndLand':
{
  "crop": "Paddy (Grade-A) | Maize | Cotton | Groundnut | Wheat",
  "landDetails": "Number of acres as string e.g. 5.0",
  "farmerId": "Pattadar passbook string",
  "audioFeedback": "Short spoken confirmation in Telugu or selected language"
}
If step == 'credentials':
{
  "password": "At least 6-character password or 6-digit numeric PIN",
  "audioFeedback": "Short spoken confirmation in Telugu or selected language"
}

Return ONLY valid JSON.`;

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI signup parse timeout')), 3500)
          );

          const aiPromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const aiResponse: any = await Promise.race([aiPromise, timeoutPromise]);
          const rawText = aiResponse.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              data: {
                ...heuristicResult,
                ...parsed,
                rawTranscript: cleanTranscript
              },
              source: 'gemini'
            });
          }
        } catch (aiErr) {
          console.warn('[Gemini Voice Signup Parse] Falling back to heuristic parser:', aiErr);
        }
      }

      return res.json({
        success: true,
        data: {
          ...heuristicResult,
          rawTranscript: cleanTranscript
        },
        source: 'heuristic'
      });

    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('[Voice Signup Parse] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to parse voice signup step' });
    }
  });

  // Vite middleware for development vs pre-compiled static bundle in production
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (typeof __filename !== 'undefined' && __filename.endsWith('.cjs')) ||
    (!process.env.NODE_ENV && fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : (typeof __dirname !== 'undefined' && fs.existsSync(path.join(__dirname, 'index.html')))
        ? __dirname
        : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('ProcureEase frontend build not found. Please verify npm run build output.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProcureEase server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });

  // Handle graceful shutdown for Cloud Run containers
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server gracefully');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

startServer();
