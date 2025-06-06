
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout } from '@/lib/types';
import { Play, Repeat, Info, AlertTriangle, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays, parseISO, isBefore, startOfToday, isEqual, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


interface WorkoutWithStatus extends Workout {
  isOverdue?: boolean;
  daysUntilDeadline?: number;
  isTodayDeadline?: boolean;
}

interface DeadlineDisplayInfo {
  statusText: string;
  cardClasses: string;
  alertIcon?: JSX.Element;
  deadlineTextColorClass: string;
}

function getDeadlineDisplayInfo(workout: WorkoutWithStatus): DeadlineDisplayInfo {
  const baseCardClasses = "flex flex-col";
  const baseDeadlineTextColor = "text-muted-foreground";

  let info: DeadlineDisplayInfo = {
    statusText: "",
    cardClasses: baseCardClasses,
    alertIcon: undefined,
    deadlineTextColorClass: baseDeadlineTextColor,
  };

  if (workout.deadline) {
    if (workout.isOverdue) {
      info.statusText = " (Vencido)";
      info.cardClasses = cn(baseCardClasses, "border-red-500 ring-2 ring-red-500/50");
      info.alertIcon = <AlertTriangle className="h-5 w-5 text-red-500" title="Deadline Vencido!" />;
      info.deadlineTextColorClass = "text-red-600 font-medium";
    } else if (workout.isTodayDeadline) {
      info.statusText = " (Hoje!)";
      info.cardClasses = cn(baseCardClasses, "border-orange-500 ring-2 ring-orange-500/50");
      info.alertIcon = <AlertTriangle className="h-5 w-5 text-orange-500" title="Deadline Hoje!" />;
      info.deadlineTextColorClass = "text-orange-600 font-medium";
    } else if (workout.daysUntilDeadline === 1) {
      info.statusText = " (Amanhã!)";
      info.cardClasses = cn(baseCardClasses, "border-yellow-500 ring-2 ring-yellow-500/50");
      info.alertIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" title="Deadline Amanhã!" />;
      info.deadlineTextColorClass = "text-yellow-600 font-medium";
    } else if (workout.daysUntilDeadline !== undefined && workout.daysUntilDeadline > 1) {
      info.statusText = ` (em ${workout.daysUntilDeadline} dias)`;
    }
  }
  return info;
}


export default function TrainingMatPage() {
  const { workouts, sessions, addSession, getWorkoutById, hasActiveSession } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [displayableWorkouts, setDisplayableWorkouts] = useState<WorkoutWithStatus[]>([]);

  useEffect(() => {
    const todayAtStart = startOfToday();

    const availableWorkouts = workouts.filter(workout => {
      const completedSessionsForThisWorkout = sessions.filter(s => s.workoutId === workout.id && s.isCompleted);

      if ((workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) && completedSessionsForThisWorkout.length === 0) {
        return true;
      }
      if (workout.deadline && completedSessionsForThisWorkout.length === 0) {
         return true;
      }

      if (!workout.repeatFrequencyDays || workout.repeatFrequencyDays <= 0) {
        return false;
      }

      const completedSessionsSorted = sessions
        .filter(s => s.workoutId === workout.id && s.isCompleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (completedSessionsSorted.length === 0) {
        return true;
      }

      const lastCompletionDate = startOfToday(parseISO(completedSessionsSorted[0].date));
      const nextAvailableDate = addDays(lastCompletionDate, workout.repeatFrequencyDays as number);

      return isEqual(todayAtStart, nextAvailableDate) || isBefore(nextAvailableDate, todayAtStart);
    });

    const workoutsWithStatus: WorkoutWithStatus[] = availableWorkouts.map(workout => {
      let isOverdue = false;
      let daysUntilDeadline: number | undefined = undefined;
      let isTodayDeadline = false;

      if (workout.deadline) {
        const deadlineDate = parseISO(workout.deadline);
        isOverdue = isBefore(deadlineDate, todayAtStart);
        daysUntilDeadline = differenceInDays(deadlineDate, todayAtStart);
        isTodayDeadline = isToday(deadlineDate);
      }
      return { ...workout, isOverdue, daysUntilDeadline, isTodayDeadline };
    });

    workoutsWithStatus.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue) {
        return (a.daysUntilDeadline ?? -Infinity) - (b.daysUntilDeadline ?? -Infinity);
      }

      if (a.isTodayDeadline && !b.isTodayDeadline) return -1;
      if (!a.isTodayDeadline && b.isTodayDeadline) return 1;
      if (a.isTodayDeadline && b.isTodayDeadline) {
        return a.name.localeCompare(b.name);
      }

      const aIsTomorrow = !a.isOverdue && !a.isTodayDeadline && a.daysUntilDeadline === 1;
      const bIsTomorrow = !b.isOverdue && !b.isTodayDeadline && b.daysUntilDeadline === 1;
      if (aIsTomorrow && !bIsTomorrow) return -1;
      if (!aIsTomorrow && bIsTomorrow) return 1;
      if (aIsTomorrow && bIsTomorrow) {
         return a.name.localeCompare(b.name);
      }

      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline === undefined) return -1;
      if (a.daysUntilDeadline === undefined && b.daysUntilDeadline !== undefined) return 1;
      if (a.daysUntilDeadline !== undefined && b.daysUntilDeadline !== undefined) {
        if (a.daysUntilDeadline === b.daysUntilDeadline) {
            return a.name.localeCompare(b.name);
        }
        return a.daysUntilDeadline - b.daysUntilDeadline;
      }

      return a.name.localeCompare(b.name);
    });

    setDisplayableWorkouts(workoutsWithStatus);

  }, [workouts, sessions]);

  const handleStartWorkout = (workoutToStart: Workout) => {
     if (hasActiveSession(workoutToStart.id)) {
      toast({
        title: "Treino Já Ativo",
        description: `O treino "${workoutToStart.name}" já possui uma sessão em andamento. Finalize-a antes de iniciar uma nova.`,
        variant: "destructive"
      });
      return;
    }

    const currentWorkoutDetails = getWorkoutById(workoutToStart.id);
    if (!currentWorkoutDetails) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os detalhes do treino para iniciá-lo.",
        variant: "destructive"
      });
      return;
    }
    addSession({
      workoutId: currentWorkoutDetails.id,
      workoutName: currentWorkoutDetails.name,
      date: new Date().toISOString(),
    });
    toast({
      title: "Treino Iniciado!",
      description: `${currentWorkoutDetails.name} foi registrado. Acompanhe seu progresso!`,
    });
    router.push('/progress');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Esteira de Treinos</h1>
        <CardDescription>
          Aqui estão os treinos prontos para serem feitos, considerando sua frequência e datas limite.
          Treinos com deadline vencido, hoje, ou amanhã aparecem primeiro e destacados.
          Treinos com frequência definida e nunca realizados também são listados.
        </CardDescription>

        {displayableWorkouts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Esteira Vazia por Enquanto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Nenhum treino está pronto para ser repetido, não há treinos com deadline definidos para hoje/amanhã/vencidos,
                ou todos os treinos com deadline e frequência já foram concluídos e aguardam o próximo ciclo.
              </p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que seus treinos na <Link href="/library" className="underline hover:text-primary">biblioteca</Link> tenham uma frequência de repetição e/ou uma data limite.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayableWorkouts.map((workout) => {
              const displayInfo = getDeadlineDisplayInfo(workout);
              const isActive = hasActiveSession(workout.id);
              return (
                <Card
                  key={workout.id}
                  className={displayInfo.cardClasses}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="font-headline flex items-center gap-2">
                         {workout.name}
                         {displayInfo.alertIcon}
                        </CardTitle>
                        {isActive && <Badge variant="destructive" className="text-xs ml-2">ATIVO</Badge>}
                    </div>
                    {workout.description && (
                      <CardDescription>{workout.description}</CardDescription>
                    )}
                    <div className="space-y-1">
                      {workout.repeatFrequencyDays && (
                        <CardDescription className="text-xs text-muted-foreground flex items-center">
                          <Repeat className="h-3 w-3 mr-1" /> Repetir a cada {workout.repeatFrequencyDays} dia(s)
                        </CardDescription>
                      )}
                      {workout.deadline && (
                         <CardDescription className={cn("text-xs flex items-center", displayInfo.deadlineTextColorClass)}>
                           <CalendarDays className="h-3 w-3 mr-1" /> Deadline: {format(parseISO(workout.deadline), "dd/MM/yyyy", { locale: ptBR })}
                           {displayInfo.statusText}
                         </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h4 className="font-medium mb-1 text-sm">Exercícios ({workout.exercises.length}):</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                      {workout.exercises.slice(0,2).map((exercise) => (
                        <li key={exercise.id} className="truncate">
                          {exercise.name}
                        </li>
                      ))}
                      {workout.exercises.length > 2 && <li>...e mais {workout.exercises.length - 2}.</li>}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStartWorkout(workout)}
                      disabled={isActive}
                      title={isActive ? "Este treino já está em andamento" : "Iniciar treino"}
                    >
                      <Play className="mr-1 h-4 w-4" /> {isActive ? "Em Andamento" : "Iniciar Agora"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
