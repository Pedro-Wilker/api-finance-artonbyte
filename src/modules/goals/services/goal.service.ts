import { prisma } from '../../../shared/prisma';

export class GoalService {

    static async createSystemGoals(userId: string, monthlyIncome: number) {
        const emergencyTarget = monthlyIncome * 6; 
        const medicalTarget = 2000.00; 

        const existingEmergency = await prisma.goal.findFirst({
            where: { user_id: userId, type: 'FINANCIAL_EMERGENCY' }
        });

        if (!existingEmergency) {
            await prisma.goal.create({
                data: {
                    user_id: userId,
                    type: 'FINANCIAL_EMERGENCY',
                    title: 'Reserva de Emergência',
                    description: 'Sua segurança financeira primária. Equivalente a 6 meses da sua renda atual.',
                    target_amount: emergencyTarget,
                    is_system: true,
                }
            });
        } else {
            await prisma.goal.update({
                where: { id: existingEmergency.id },
                data: { target_amount: emergencyTarget }
            });
        }

        const existingMedical = await prisma.goal.findFirst({
            where: { user_id: userId, type: 'FINANCIAL_MEDICAL' }
        });

        if (!existingMedical) {
            await prisma.goal.create({
                data: {
                    user_id: userId,
                    type: 'FINANCIAL_MEDICAL',
                    title: 'Reserva Médica',
                    description: 'Fundo para emergências de saúde e imprevistos hospitalares.',
                    target_amount: medicalTarget,
                    is_system: true,
                }
            });
        }
    }

    static async getUserGoals(userId: string) {
        return await prisma.goal.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'asc' },
            include: {
                _count: {
                    select: { transactions: true, demands: true }
                }
            }
        });
    }

    static async createGoal(userId: string, data: any) {
        return await prisma.goal.create({
            data: {
                user_id: userId,
                type: data.type,
                title: data.title,
                description: data.description,
                target_amount: data.target_amount,
                target_quantity: data.target_quantity,
                deadline: data.deadline ? new Date(data.deadline) : null,
                is_system: false,
            }
        });
    }

    static async deleteGoal(userId: string, goalId: string) {
        const goal = await prisma.goal.findUnique({ where: { id: goalId } });

        if (!goal || goal.user_id !== userId) throw new Error("Meta não encontrada.");
        if (goal.is_system) throw new Error("Metas do sistema não podem ser excluídas.");

        return await prisma.goal.delete({ where: { id: goalId } });
    }
}