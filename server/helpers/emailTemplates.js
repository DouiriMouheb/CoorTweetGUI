exports.createPasswordResetHTML = (newPassword) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .password {
          background-color: #f8f8f8;
          padding: 10px;
          border: 1px dashed #ccc;
          font-family: monospace;
          font-size: 16px;
          margin: 10px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Reset</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your password has been reset as requested. Here is your new password:</p>
          <div class="password">${newPassword}</div>
          <p><strong>Important:</strong> For security reasons, please log in and change your password immediately.</p>
          <p>If you did not request this password reset, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} CoorTweet. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};
