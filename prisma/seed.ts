import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando o Seed do Banco de Dados...');

    const email = 'admin@local.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log(`⚠️ Usuário ${email} já existe no banco. Pulando criação.`);
        return;
    }

    const user = await prisma.user.create({
        data: {
            email,
            password_hash: hashedPassword,
            full_name: 'Administrador Local',
            cpf: '000.000.000-00',
            monthly_income: 5000.00,
            email_verified: true,
        }
    });

    console.log(`✅ Usuário criado com sucesso!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);

    const emergencyTarget = Number(user.monthly_income) * 6;

    await prisma.goal.createMany({
        data: [
            {
                user_id: user.id,
                type: 'FINANCIAL_EMERGENCY',
                title: 'Reserva de Emergência',
                description: 'Gerado pelo Seed.',
                target_amount: emergencyTarget,
                is_system: true,
            },
            {
                user_id: user.id,
                type: 'FINANCIAL_MEDICAL',
                title: 'Reserva Médica',
                description: 'Gerado pelo Seed.',
                target_amount: 2000.00,
                is_system: true,
            }
        ]
    });

    console.log(`🎯 Metas do sistema geradas para o Admin!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });