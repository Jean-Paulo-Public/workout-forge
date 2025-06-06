
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, History, TrendingUp, CheckCircle2, PlayCircle } from 'lucide-react'; // Changed Flame to PlayCircle
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useState, useCallback } from 'react';
import type { Workout, WorkoutSession, SessionExercisePerformance } from '@/lib/types';
import { DeadlineUpdateModal } from '@/components/DeadlineUpdateModal';
import { TrackWorkoutModal } from '@/components/TrackWorkoutModal'; // New Modal

const PlaceholderChart = () => (
  <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
    <BarChart3 className="h-16 w-16 text-muted-foreground" />
    <p className="ml-2 text-muted-foreground">Gráfico em Breve</p>
  </div>
);

export default function ProgressTrackingPage() {
  const { sessions, getWorkoutById, updateWorkout } = useAppContext(); // Removed completeSession, markWarmupAsCompleted
  const { toast } = useToast();
  const [workoutToUpdateDeadline, setWorkoutToUpdateDeadline] = useState<Workout | null>(null);
  
  // State for the new TrackWorkoutModal
  const [trackingSession, setTrackingSession] = useState<WorkoutSession | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Get the workout associated with the session we want to track
  const workoutForTrackingModal = trackingSession ? getWorkoutById(trackingSession.workoutId) : undefined;

  const sortedSessions = [...sessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openTrackWorkoutModal = (session: WorkoutSession) => {
    setTrackingSession(session);
    setIsTrackModalOpen(true);
  };

  const handleWorkoutFinallyCompleted = useCallback(() => {
    // This function is called from TrackWorkoutModal AFTER completeSession in context is called.
    // Now, we check if we need to show the deadline update modal.
    if (trackingSession) {
        const workout = getWorkoutById(trackingSession.workoutId);
        if (workout && workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) {
            setWorkoutToUpdateDeadline(workout); // This will open the DeadlineUpdateModal
        }
        toast({
            title: "Treino Finalizado!",
            description: `A sessão de ${trackingSession.workoutName} foi marcada como concluída e sua performance registrada.`,
        });
    }
    setTrackingSession(null); // Clear the session being tracked as it's now complete
  }, [trackingSession, getWorkoutById, toast]);


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
              <CardDescription>Revise suas sessões de treino. Acompanhe e finalize os treinos.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda. Inicie um treino da sua biblioteca!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {sortedSessions.map(session => {
                      return (
                      <li key={session.id} className="p-3 border rounded-md bg-card hover:bg-muted/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{session.workoutName}</p>
                            <p className="text-sm text-muted-foreground">
                              Iniciado em: {format(new Date(session.date), 'PPP p', { locale: ptBR })}
                            </p>
                            {session.notes && <p className="text-xs italic mt-1 text-muted-foreground">{session.notes}</p>}
                          </div>
                          {!session.isCompleted ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openTrackWorkoutModal(session)}
                              className="whitespace-nowrap"
                            >
                              <PlayCircle className="mr-2 h-4 w-4 text-primary-foreground" /> Acompanhar Treino
                            </Button>
                          ) : (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Concluído
                            </span>
                          )}
                        </div>
                        {session.isCompleted && session.exercisePerformances && session.exercisePerformances.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <h4 className="text-xs font-semibold mb-1">Performance Registrada:</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                              {session.exercisePerformances.map(perf => (
                                <li key={perf.exerciseId}>
                                  {perf.exerciseName}: {perf.weightUsed || 'N/A'}
                                  {perf.isWarmupCompleted && workoutForTrackingModal?.exercises.find(e=>e.id === perf.exerciseId)?.hasWarmup ? ' (Aquec. ✓)' : ''}
                                  {perf.isExerciseCompleted ? ' (Ex. ✓)' : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
      {isTrackModalOpen && trackingSession && workoutForTrackingModal && (
        <TrackWorkoutModal
          isOpen={isTrackModalOpen}
          onClose={() => {
            setIsTrackModalOpen(false);
            // setTrackingSession(null); // Don't nullify here, might be needed if modal is reopened before completion
          }}
          session={trackingSession}
          workout={workoutForTrackingModal}
          onWorkoutFinallyCompleted={handleWorkoutFinallyCompleted}
        />
      )}
    </AppLayout>
  );
}
