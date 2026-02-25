import nodemailer from 'nodemailer';

export class MailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
        port: Number(process.env.SMTP_PORT) || 2525,
        auth: {
            user: process.env.SMTP_USER || 'usuario_teste',
            pass: process.env.SMTP_PASS || 'senha_teste'
        }
    });

    static async sendVerificationEmail(to: string, token: string) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/v1/auth/verify-email/${token}`;
        
        const mailOptions = {
            from: '"Gestão Financeira API" <no-reply@gestaofinanceira.com>',
            to,
            subject: 'Ative sua conta - Gestão Financeira',
            html: `
        <h2>Bem-vindo!</h2>
        <p>Por favor, clique no link abaixo para verificar sua conta. O link expira em 24 horas.</p>
        <a href="${verifyUrl}" target="_blank">Verificar E-mail</a>
      `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✉️ [Mail] E-mail de verificação enviado para ${to}`);
        } catch (error) {
            console.error('❌ [Mail] Erro ao enviar e-mail:', error);
        }
    }
}