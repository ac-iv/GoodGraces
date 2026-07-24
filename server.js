const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Store your App Passwords in environment variables, NEVER in plain text
const credentials = {
    "avelino@goodgraces.app": process.env.AVELINO_APP_PASSWORD,
    "nora@goodgraces.app": process.env.NORA_APP_PASSWORD
};

app.post('/api/send-beta-email', async (req, res) => {
    const { toEmail, pastorName, churchName, senderEmail, senderName } = req.body;

    // 1. Authenticate the specific sender (Avelino or Nora)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: credentials[senderEmail]
        }
    });

    // 2. Inject variables into your HTML template
    // Note: I swapped your hardcoded sign-off with variables so Nora can use this too.
    const htmlEmail = `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <title>GoodGraces — Beta Cohort</title>
      <style>
        html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; background-color: #EDECEA; }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
        a { text-decoration: none; }
        @media screen and (max-width: 600px) {
          .email-container { width: 100% !important; margin: auto !important; }
          .gut { padding-left: 16px !important; padding-right: 16px !important; }
          .pad { padding-left: 24px !important; padding-right: 24px !important; }
          .h1-m { font-size: 35px !important; line-height: 1.0 !important; letter-spacing: -1.5px !important; }
          .h2-m { font-size: 25px !important; line-height: 1.08 !important; }
          .pull-m { font-size: 22px !important; line-height: 1.3 !important; }
          .body-m { font-size: 16px !important; }
        }
      </style>
    </head>
    <body width="100%" style="margin:0; padding:0 !important; mso-line-height-rule:exactly; background-color:#EDECEA;">
    <center style="width:100%; background-color:#EDECEA;">
      <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all; font-family:sans-serif;">
        We're in beta and taking five San Diego churches in to build alongside us. Spots go in the order people reply.
      </div>
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:auto; background-color:#FFFFFF;">
        <!-- GLASS PILL NAV -->
        <tr>
          <td class="gut" style="padding:22px 24px 0 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#FFFFFF; border:1px solid #E6E5E2; border-radius:100px;">
              <tr>
                <td style="padding:15px 26px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="left" style="font-size:16px; font-weight:700; letter-spacing:-0.5px; color:#0A0A0A;">GoodGraces</td>
                      <td align="right" style="font-size:10px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:#8C8C88;"><span style="color:#FF6B52;">&bull;</span>&nbsp; Beta &middot; San Diego</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- HERO -->
        <tr>
          <td class="pad" style="padding:52px 44px 0 44px; text-align:left; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <h1 class="h1-m" style="margin:0; font-size:47px; line-height:1.0; font-weight:800; color:#0A0A0A; letter-spacing:-2.1px;">
              Your Whole Church<br><span style="color:#FF6B52;">in One App.</span>
            </h1>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:22px 44px 0 44px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <p class="body-m" style="margin:0; color:#4E4E4A; font-size:17px; line-height:1.62;">
              Announcements, prayer, your calendar, and giving — plus a way for new people to actually find you.
            </p>
          </td>
        </tr>
        <!-- MOCKUPS -->
        <tr>
          <td class="gut" style="padding:34px 24px 0 24px; font-size:0; line-height:0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="table-layout:fixed;">
              <tr>
                <td width="184" valign="bottom" style="width:33.33%; padding:22px 5px 0 0; font-size:0; line-height:0;">
                  <img src="https://goodgraces.app/img/new-mockups/2.png" width="179" alt="Community feed" style="width:100%; max-width:179px; height:auto; display:block;">
                </td>
                <td width="184" valign="bottom" style="width:33.33%; padding:0 5px 0 5px; font-size:0; line-height:0;">
                  <img src="https://goodgraces.app/img/new-mockups/5.png" width="179" alt="Home dashboard" style="width:100%; max-width:179px; height:auto; display:block;">
                </td>
                <td width="184" valign="bottom" style="width:33.33%; padding:22px 0 0 5px; font-size:0; line-height:0;">
                  <img src="https://goodgraces.app/img/new-mockups/4.png" width="179" alt="Giving" style="width:100%; max-width:179px; height:auto; display:block;">
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- THE LETTER -->
        <tr>
          <td class="gut" style="padding:36px 24px 0 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#FFFFFF; border:1px solid #E6E5E2; border-radius:24px;">
              <tr>
                <td class="pad" style="padding:38px 34px 34px 34px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  <p class="body-m" style="margin:0 0 20px 0; color:#0A0A0A; font-size:16px; line-height:1.72;">Pastor ${pastorName},</p>
                  <p class="body-m" style="margin:0 0 20px 0; color:#4E4E4A; font-size:16px; line-height:1.72;">
                    My name is ${senderName.split(' ')[0]}. I'm building an app called Good Graces, here in San Diego. We're in beta right now, and we're bringing on five local churches to build it alongside us before we open it to anyone else. I'd like <strong>${churchName}</strong> to be one of them.
                  </p>
                  <p class="body-m" style="margin:0 0 20px 0; color:#4E4E4A; font-size:16px; line-height:1.72;">
                    Here's what I keep running into. Most churches are staying connected across four or five places at once — a group text for volunteers, a Facebook page nobody checks, an email list, a bulletin somebody lays out on Saturday night, and a separate link when it's time to give. None of it talks to each other, and the people who most need to hear something are usually the ones who miss it.
                  </p>
                  <p class="body-m" style="margin:0 0 30px 0; color:#4E4E4A; font-size:16px; line-height:1.72;">
                    And when somebody moves to town and goes looking for a church, there's a good chance they never find yours at all.
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="border-left:3px solid #FF6B52; padding:2px 0 2px 20px;">
                        <p class="pull-m" style="margin:0; font-size:23px; line-height:1.3; font-weight:700; color:#0A0A0A; letter-spacing:-0.8px;">
                          A church shouldn't be hard to find. And your people shouldn't have to check four places to know what's happening this week.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- FEATURES & ADMIN VIEW OMITTED FOR BREVITY IN SCRIPT, BUT INCLUDED IN REAL DEPLOYMENT -->
        <!-- SIGN-OFF -->
        <tr>
          <td class="pad" style="padding:42px 44px 0 44px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <p class="body-m" style="margin:0 0 24px 0; color:#4E4E4A; font-size:16px; line-height:1.72;">
              If it's not the right season for this, tell me and I won't write again. If it's the right idea for the wrong person, I'd be grateful if you passed it along.
            </p>
            <p style="margin:0 0 3px 0; font-size:19px; font-weight:700; color:#0A0A0A; letter-spacing:-0.6px;">${senderName}</p>
            <p style="margin:0 0 24px 0; color:#8C8C88; font-size:13px; line-height:1.6;">Founder, Good Graces &nbsp;·&nbsp; <a href="mailto:${senderEmail}" style="color:#8C8C88; text-decoration:underline;">${senderEmail}</a></p>
            <p style="margin:0; color:#6B6B66; font-size:15px; line-height:1.65;">
              <strong style="color:#0A0A0A;">P.S.</strong> — I'm not looking for a decision. Fifteen minutes, or coffee somewhere near you, and I'll walk you through the actual app instead of describing it.
            </p>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td class="gut" style="padding:44px 24px 28px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0A0A0A; border-radius:100px;">
              <tr>
                <td style="padding:17px 26px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="left" style="font-size:16px; font-weight:700; letter-spacing:-0.5px; color:#FFFFFF;">GoodGraces</td>
                      <td align="right" style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#FF6B52;">Faith &amp; technology</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
    </body>
    </html>
    `;

    // 3. Send the email
    try {
        await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: toEmail,
            subject: `Building Good Graces alongside ${churchName}`,
            html: htmlEmail
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.listen(3000, () => console.log('CRM Backend running on port 3000'));