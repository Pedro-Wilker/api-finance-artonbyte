import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class MailService {

    static async sendVerificationEmail(to: string, token: string) {
        const verificationLink = `https://finance.artonbyte.com.br/verify-email/${token}`;
        try {
            const { data, error } = await resend.emails.send({
                from: 'FinanceApp <nao-responda@artonbyte.com.br>',
                to: to,
                subject: 'Confirme sua conta no FinanceApp',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo ao FinanceApp! 🚀</h2>
            <p>Falta muito pouco para você começar a controlar suas finanças.</p>
            <p>Clique no botão abaixo para ativar sua conta:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
              Ativar Minha Conta
            </a>
            <p style="margin-top: 24px; font-size: 14px; color: #666;">
              Se o botão não funcionar, copie e cole este link no navegador:<br>
              ${verificationLink}
            </p>
          </div>
        `,
            });

            if (error) {
                console.error('❌ Erro do Resend (Verificação):', error);
            } else {
                console.log(`✅ E-mail de verificação enviado para ${to}! ID: ${data?.id}`);
            }
        } catch (err) {
            console.error('❌ Erro inesperado ao enviar e-mail:', err);
        }
    }

    static async sendPasswordResetEmail(to: string, token: string) {
        const resetLink = `https://finance.artonbyte.com.br/reset-password/${token}`;

        try {
            const { data, error } = await resend.emails.send({
                from: 'FinanceApp <nao-responda@artonbyte.com.br>',
                to: to,
                subject: 'Recuperação de Senha - FinanceApp',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperação de Senha 🔒</h2>
            <p>Você solicitou a redefinição da sua senha. Se não foi você, ignore este e-mail.</p>
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
              Redefinir Minha Senha
            </a>
          </div>
        `,
            });

            if (error) {
                console.error('❌ Erro do Resend (Reset de Senha):', error);
            } else {
                console.log(`✅ E-mail de reset enviado para ${to}! ID: ${data?.id}`);
            }
        } catch (err) {
            console.error('❌ Erro inesperado ao enviar e-mail:', err);
        }
    }


    static async sendRoutineReminder(to: string, userName: string, routineTitle: string, time: string) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'FinanceApp <nao-responda@artonbyte.com.br>',
                to: to,
                subject: `⏰ Lembrete: ${routineTitle}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 8px;">
            <div style="background-color: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">Olá, ${userName.split(' ')[0]}! 👋</h2>
              <p style="color: #475569; font-size: 16px;">
                Este é um lembrete rápido da sua rotina programada para as <strong>${time}</strong>.
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e3a8a; margin: 0; font-size: 18px;">🎯 ${routineTitle}</h3>
              </div>
              
              <p style="color: #475569; font-size: 14px; margin-bottom: 0;">
                Acesse o seu painel do <a href="https://finance.artonbyte.com.br" style="color: #3b82f6; text-decoration: none; font-weight: bold;">FinanceApp</a> para marcar esta tarefa como concluída!
              </p>
            </div>
          </div>
        `,
            });

            if (error) {
                console.error(`❌ Erro do Resend (Lembrete ${routineTitle}):`, error);
            } else {
                console.log(`✅ Lembrete de rotina enviado para ${to}!`);
            }
        } catch (err) {
            console.error('❌ Erro inesperado ao enviar lembrete:', err);
        }
    }
}