
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, History, TrendingUp, CheckCircle2, Flame } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Workout } from '@/lib/types';
import { DeadlineUpdateModal } from '@/components/DeadlineUpdateModal';


const PlaceholderChart = () => (
  <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
    <BarChart3 className="h-16 w-16 text-muted-foreground" />
    <p className="ml-2 text-muted-foreground">Gráfico em Breve</p>
  </div>
);

export default function ProgressTrackingPage() {
  const { sessions, completeSession, getWorkoutById, updateWorkout, markWarmupAsCompleted } = useAppContext();
  const { toast } = useToast();
  const [workoutToUpdateDeadline, setWorkoutToUpdateDeadline] = useState<Workout | null>(null);

  const sortedSessions = [...sessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCompleteSession = (sessionId: string, workoutId: string, workoutName: string) => {
    completeSession(sessionId);
    toast({
      title: "Treino Finalizado!",
      description: `A sessão de ${workoutName} foi marcada como concluída.`,
    });

    const workout = getWorkoutById(workoutId);
    if (workout && workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) {
      setWorkoutToUpdateDeadline(workout);
    }
  };

  const handleMarkWarmupCompleted = (sessionId: string, workoutId: string) => {
    const workout = getWorkoutById(workoutId);
    const firstExerciseName = workout?.exercises[0]?.name;
    markWarmupAsCompleted(sessionId, firstExerciseName);
    toast({
      title: "Aquecimento Concluído!",
      description: `Aquecimento para ${firstExerciseName || 'o treino'} finalizado. Continue com o treino principal!`,
    });
  };

  const handleDeadlineSave = (updatedWorkoutId: string, newDeadline?: Date) => {
    const workoutToUpdate = getWorkoutById(updatedWorkoutId);
    if (workoutToUpdate) {
      updateWorkout({ ...workoutToUpdate, deadline: newDeadline ? newDeadline.toISOString() : undefined });
      toast({
        title: "Deadline Atualizado!",
        description: `O deadline para ${workoutToUpdate.name} foi ${newDeadline ? 'definido' : 'removido'}.`,
      });
    }
    setWorkoutToUpdateDeadline(null);
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Acompanhamento de Progresso</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Tendências de Treino
              </CardTitle>
              <CardDescription>Visualize a frequência e o volume dos seus treinos ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <History className="text-primary" />
                Histórico de Treinos
              </CardTitle>
              <CardDescription>Revise suas sessões de treino. Marque as sessões em andamento como finalizadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda. Inicie um treino da sua biblioteca!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {sortedSessions.map(session => {
                      const workoutDetails = getWorkoutById(session.workoutId);
                      const firstExerciseHasWarmup = workoutDetails?.exercises[0]?.hasWarmup === true;
                      const isWarmupPhaseActive = firstExerciseHasWarmup && !session.warmupCompleted;

                      return (
                      <li key={session.id} className="p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{session.workoutName}</p>
                            <p className="text-sm text-muted-foreground">
                              Iniciado em: {format(new Date(session.date), 'PPP p', { locale: ptBR })}
                            </p>
                            {session.notes && <p className="text-xs italic mt-1 text-muted-foreground">{session.notes}</p>}
                          </div>
                          {!session.isCompleted ? (
                            isWarmupPhaseActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkWarmupCompleted(session.id, session.workoutId)}
                                className="whitespace-nowrap"
                              >
                                <Flame className="mr-2 h-4 w-4 text-orange-500" /> Concluir Aquecimento
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleCompleteSession(session.id, session.workoutId, session.workoutName)}
                                className="whitespace-nowrap"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-primary-foreground" /> Finalizar Treino
                              </Button>
                            )
                          ) : (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Concluído
                            </span>
                          )}
                        </div>
                      </li>
                    )})}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Mais Estatísticas</CardTitle>
            <CardDescription>Desempenho detalhado de exercícios e recordes pessoais (PRs) estarão disponíveis aqui em atualizações futuras.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Fique ligado para mais funcionalidades avançadas de acompanhamento de progresso!</p>
          </CardContent>
        </Card>

      </div>
      {workoutToUpdateDeadline && (
        <DeadlineUpdateModal
          isOpen={!!workoutToUpdateDeadline}
          onClose={() => setWorkoutToUpdateDeadline(null)}
          workout={workoutToUpdateDeadline}
          onSave={handleDeadlineSave}
        />
      )}
    </AppLayout>
  );
}
