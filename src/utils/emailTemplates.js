export const getPasswordResetTemplate = (url) => ({
  subject: "🔒 Password Reset Request",
  text: `You requested a password reset. Click the link below to reset your password:\n${url}\nIf you did not make this request, you can ignore this email.`,
  html: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
  <style>
    body {
      background: #A1A9DF;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4A5497;
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .content {
      padding: 20px;
      color: #333;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #5763AE;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: background 0.3s ease;
    }
    .button:hover {
      background-color: #3C457B;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password for your Dive Africa LMS account.</p>
      <p>If you made this request, click the button below to reset your password:</p>
      <p><a href="${url}" class="button">Reset Password</a></p>
      <p style="background-color: #5763AE; color: #FFF;">This link expires in 5 minutes</p>
      <p>If you didn’t request this, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>Thank you,<br>The Dive Africa Team</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dive Africa. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
});

export const sendActivationCodeTemplate = (activationCode) => ({
  subject: "🎓 Activate Your LMS Account",
  text: `Your activation code is ${activationCode}.`,
  html: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate Your Account</title>
  <style>
    body {
      background: #A1A9DF;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      background: #ffffff;
      margin: 40px auto;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .header {
      background: #4A5497;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      color: #333333;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      background: #e0f2fe;
      color: #4F5999;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      letter-spacing: 3px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #B7BAC7;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Dive Africa LMS 🎉</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>To complete your account setup, please use the OTP code below:</p>
      <div class="otp-code">${activationCode}</div>
      <p style="background-color: #5763AE; color: #FFF; padding: 20px; border-radius: 0 0 12px 12px ; text-align: center; ">This code is valid for 5 minutes. Do not share it with anyone.</p>
      <p>Thanks for joining us. We’re excited to have you on board!</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dive Africa. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
});
