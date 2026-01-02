export class EmailService {
  static async send(to: string, subject: string, html: string) {
    // DEV ONLY — replace with SMTP/Resend/SES later
    console.log("Email sent");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", html);
  }
}
