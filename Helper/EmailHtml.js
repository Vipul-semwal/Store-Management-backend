const dotenv = require("dotenv")
dotenv.config()



const html = (name, user_id, route) => {

  return (
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    /* Your CSS styles here */
  </style>
</head>
<body style="background-color: #e9ecef;">

  <!-- Preheader -->
  <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
  </div>

  <!-- Logo -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    </tr>
  </table>

  <!-- Email Content -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <p style="font-size: 16px; line-height: 24px;">Tap the button below to confirm your email address</p>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <a href="${route}/${user_id} " target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; background-color: #1a82e2; border-radius: 6px;">verify Your Email</a >
      </td >
    </tr >
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <p style="font-size: 16px; line-height: 24px;">If that doesn't work, copy and paste the following link in your browser:</p>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <p style="font-size: 16px; line-height: 24px;">Cheers,<br> Paste</p>
      </td>
    </tr>
  </table >

  < !--Footer -->
  

</body >
</html > `
  );
}

module.exports = html;
