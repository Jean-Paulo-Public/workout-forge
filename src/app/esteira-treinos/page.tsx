
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, WorkoutSession } from '@/lib/types';
import { Play, CalendarPlus, Repeat, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TrainingMatPage() {
  const { workouts, sessions, addSession, getWorkoutById } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar para o início do dia

    const filteredWorkouts = workouts.filter(workout => {
      if (!workout.repeatFrequencyDays || workout.repeatFrequencyDays <= 0) {
        return false; // Só considera treinos com frequência de repetição definida
      }

      const completedSessions = sessions
        .filter(s => s.workoutId === workout.id && s.isCompleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (completedSessions.length === 0) {
        // Se nunca foi feito, mas tem frequência, está disponível
        return true; 
      }

      const lastCompletionDate = parseISO(completedSessions[0].date);
      lastCompletionDate.setHours(0,0,0,0); // Normalizar data da última conclusão

      const nextAvailableDate = addDays(lastCompletionDate, workout.repeatFrequencyDays);
      
      return today >= nextAvailableDate;
    });
    setAvailableWorkouts(filteredWorkouts);
  }, [workouts, sessions]);

  const handleStartWorkout = (workoutToStart: Workout) => {
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

  const handleScheduleWorkout = (workout: Workout) => {
    router.push(`/scheduler?workoutId=${workout.id}&workoutName=${encodeURIComponent(workout.name)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Esteira de Treinos</h1>
        <CardDescription>
          Aqui estão os treinos que estão prontos para serem feitos novamente, com base na frequência que você definiu, ou treinos novos que ainda não foram iniciados.
        </CardDescription>

        {availableWorkouts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Esteira Vazia por Enquanto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Nenhum treino está pronto para ser repetido ou iniciado no momento.
              </p>
              <p className="text-sm text-muted-foreground">
                Certifique-se de que seus treinos na <Link href="/library" className="underline hover:text-primary">biblioteca</Link> tenham uma frequência de repetição definida. Treinos concluídos reaparecerão após o período de descanso.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableWorkouts.map((workout) => (
              <Card key={workout.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">{workout.name}</CardTitle>
                  {workout.description && (
                    <CardDescription>{workout.description}</CardDescription>
                  )}
                  <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
                    <Repeat className="h-3 w-3 mr-1" /> Repetir a cada {workout.repeatFrequencyDays} dia(s)
                  </CardDescription>
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
                  <Button variant="default" size="sm" onClick={() => handleStartWorkout(workout)}>
                    <Play className="mr-1 h-4 w-4" /> Iniciar Agora
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleScheduleWorkout(workout)}>
                    <CalendarPlus className="mr-1 h-4 w-4" /> Agendar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
