import { prisma } from '../../../shared/prisma';
import { TaskStatus } from '@prisma/client';
import { differenceInDays, startOfDay, endOfDay, addDays } from 'date-fns'; // Dica: rode `npm install date-fns` se não tiver

export class RoutineService {

  static async createRoutine(userId: string, data: any) {
    return await prisma.routine.create({
      data: {
        user_id: userId,
        title: data.title,
        description: data.description,
        days_of_week: data.days_of_week,
        time_of_day: data.time_of_day,
      }
    });
  }

  static async getUserRoutines(userId: string) {
    return await prisma.routine.findMany({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' }
    });
  }

  static async updateTaskStatus(userId: string, taskId: string, status: TaskStatus) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.user_id !== userId) throw new Error("Tarefa não encontrada.");

    return await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });
  }

  static async createTask(userId: string, data: any) {
    return await prisma.task.create({
      data: {
        user_id: userId,
        title: data.title,
        description: data.description,
        due_date: data.due_date ? new Date(data.due_date) : new Date(),
        status: 'PENDING'
      }
    });
  }

  static async getDailyCockpit(userId: string, dateIso: string) {
    const targetDate = new Date(dateIso);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);
    const dayOfWeek = targetDate.getDay();

    const dailyTasks = await prisma.task.findMany({
      where: {
        user_id: userId,
        due_date: { gte: start, lte: end }
      }
    });

    const activeRoutines = await prisma.routine.findMany({
      where: {
        user_id: userId,
        is_active: true,
        days_of_week: { has: dayOfWeek }
      }
    });

    const upcomingDemands = await prisma.demand.findMany({
      where: {
        user_id: userId,
        status: { not: 'DONE' },
        deadline: {
          gte: startOfDay(new Date()),
          lte: endOfDay(addDays(new Date(), 7))
        }
      },
      select: { id: true, title: true, deadline: true, status: true, priority: true }
    });

    const demandsWithCountdown = upcomingDemands.map(demand => {
      const daysLeft = demand.deadline ? differenceInDays(demand.deadline, new Date()) : 0;
      return {
        ...demand,
        days_left: daysLeft,
        is_urgent: daysLeft <= 2
      };
    });

    return {
      date: start.toISOString(),
      routines_to_execute: activeRoutines,
      scheduled_tasks: dailyTasks,
      attention_demands: demandsWithCountdown
    };
  }
}