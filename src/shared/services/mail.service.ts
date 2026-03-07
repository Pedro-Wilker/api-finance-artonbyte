import { Resend } from 'resend';

// Inicializa o Resend com a chave do seu .env
const resend = new Resend(process.env.RESEND_API_KEY);

export class MailService {

    // 1. E-mail de Verificação de Conta
    static async sendVerificationEmail(to: string, token: string) {
        // 🚀 Ajustado para o domínio do Front-end em produção
        const verificationLink = `https://finance.artonbyte.com.br/verify-email/${token}`;

        try {
            const { data, error } = await resend.emails.send({
                // 🚀 Ajustado para o seu domínio verificado no Resend
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

    // 2. E-mail de Recuperação de Senha
    static async sendPasswordResetEmail(to: string, token: string) {
        // 🚀 Ajustado para o domínio do Front-end em produção
        const resetLink = `https://finance.artonbyte.com.br/reset-password/${token}`;
        
        try {
            const { data, error } = await resend.emails.send({
                // 🚀 Ajustado para o seu domínio verificado no Resend
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
}