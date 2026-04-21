import cron from 'node-cron';
import { prisma } from '../../shared/prisma';
import { MailService } from '../../shared/services/mail.service';
import { format } from 'date-fns';

export function startRoutineCron() {
    console.log('⏰ [Cron] Serviço de Alertas de Rotina inicializado.');

    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentDayOfWeek = now.getDay();
            const currentTimeString = format(now, 'HH:mm');

            const routinesToAlert = await prisma.routine.findMany({
                where: {
                    is_active: true,
                    time_of_day: currentTimeString,
                    days_of_week: {
                        has: currentDayOfWeek
                    }
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            full_name: true
                        }
                    }
                }
            });

            if (routinesToAlert.length > 0) {
                console.log(`🔔 Disparando alertas para ${routinesToAlert.length} rotinas às ${currentTimeString}...`);

                for (const routine of routinesToAlert) {
                    if (routine.user && routine.user.email) {

                        const userName = routine.user.full_name || 'Usuário';

                        MailService.sendRoutineReminder(
                            routine.user.email,
                            userName,
                            routine.title,
                            routine.time_of_day!
                        );
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro no Cron de Rotinas:', error);
        }
    });
}