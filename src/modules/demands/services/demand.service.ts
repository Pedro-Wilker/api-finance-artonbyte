import { prisma } from '../../../shared/prisma';
import { DemandStatus, Priority } from '@prisma/client';

export class DemandService {

    static async getUserDemands(userId: string) {
        return await prisma.demand.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                goal: {
                    select: { id: true, title: true }
                }
            }
        });
    }

    static async createDemand(userId: string, data: any) {
        return await prisma.demand.create({
            data: {
                user_id: userId,
                title: data.title,
                description: data.description,
                status: data.status || 'TODO',
                priority: data.priority || 'MEDIUM',
                deadline: data.deadline ? new Date(data.deadline) : null,
                goal_id: data.goal_id || null,
            }
        });
    }

    static async updateStatus(userId: string, demandId: string, newStatus: DemandStatus) {
        const demand = await prisma.demand.findUnique({ where: { id: demandId } });
        if (!demand || demand.user_id !== userId) {
            throw new Error("Demanda não encontrada ou acesso negado.");
        }

        return await prisma.demand.update({
            where: { id: demandId },
            data: { status: newStatus }
        });
    }

    static async updateDemand(userId: string, demandId: string, data: any) {
        const demand = await prisma.demand.findUnique({ where: { id: demandId } });
        if (!demand || demand.user_id !== userId) {
            throw new Error("Demanda não encontrada ou acesso negado.");
        }

        return await prisma.demand.update({
            where: { id: demandId },
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                deadline: data.deadline ? new Date(data.deadline) : null,
                goal_id: data.goal_id,
            }
        });
    }

    static async deleteDemand(userId: string, demandId: string) {
        const demand = await prisma.demand.findUnique({ where: { id: demandId } });
        if (!demand || demand.user_id !== userId) {
            throw new Error("Demanda não encontrada ou acesso negado.");
        }

        return await prisma.demand.delete({ where: { id: demandId } });
    }
}