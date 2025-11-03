const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

// Body parsers for JSON and form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (images, pdf, css, js) from project root
app.use(express.static(rootDir));

// Helper to send a specific HTML file safely
function sendHtml(res, fileName) {
  res.sendFile(path.join(rootDir, fileName));
}

// Routes for pages
app.get('/', (req, res) => sendHtml(res, 'index.html'));
app.get('/index', (req, res) => sendHtml(res, 'index.html'));
app.get('/about', (req, res) => sendHtml(res, 'about.html'));
app.get('/projects', (req, res) => sendHtml(res, 'projects.html'));
app.get('/skills', (req, res) => sendHtml(res, 'skills.html'));
app.get('/contact', (req, res) => sendHtml(res, 'contact.html'));
app.get('/portfolio', (req, res) => sendHtml(res, 'portfolio.html'));
app.get('/eye-care', (req, res) => sendHtml(res, 'eye-care.html'));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ success: false, error: 'SMTP credentials not configured.' });
    }

    const transporter = nodemailer.createTransport({
      // Default to Gmail SMTP if not provided via env
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true),
      auth: { user: smtpUser, pass: smtpPass }
    });

    const toEmail = process.env.TO_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: toEmail,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br>')}</p>`
    });

    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// Fallback 404 to home or a simple message
app.use((req, res) => {
  res.status(404).sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


