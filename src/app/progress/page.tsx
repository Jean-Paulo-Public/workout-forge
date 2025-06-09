
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { BarChart3, History, TrendingUp, /*CheckCircle2, PlayCircle, Flame, Trash2, Undo2*/ } from 'lucide-react';
// import { useAppContext } from '@/contexts/AppContext';
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useToast } from '@/hooks/use-toast';
// import { useState, useCallback, useId, useMemo } from 'react';
import type { /*Workout,*/ WorkoutSession, /*SessionExercisePerformance*/ } from '@/lib/types';
// import { DeadlineUpdateModal } from '@/components/DeadlineUpdateModal'; // Commented out as handlers are removed
// import { TrackWorkoutModal } from '@/components/TrackWorkoutModal';
/*
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
*/


/* // PlaceholderChart commented out
const PlaceholderChart = () => {
  return ( // Explicit return
    <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
      <BarChart3 className="h-16 w-16 text-muted-foreground" />
      <p className="ml-2 text-muted-foreground">Gráfico em Breve (PlaceholderChart comentado)</p>
    </div>
  );
};
*/

const ProgressTrackingPage = () => {
  // const {
  //   sessions,
  //   getWorkoutById,
  //   updateWorkout,
  //   markGlobalWarmupAsCompleted,
  //   undoGlobalWarmup,
  //   completeSession,
  //   deleteSession,
  //   hasActiveSession,
  //   getLastUsedWeightForExercise
  // } = useAppContext();
  // const { toast } = useToast();

  // const [workoutToUpdateDeadline, setWorkoutToUpdateDeadline] = useState<Workout | null>(null);
  // const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  // const deleteDialogDescriptionId = useId();

  // const [trackingSession, setTrackingSession] = useState<WorkoutSession | null>(null);
  // const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Simpler version for now
  const sessions: WorkoutSession[] = []; // Dummy data for parsing
  const sortedSessions: WorkoutSession[] = []; // Dummy data for parsing

  // const openTrackWorkoutModal = (session: WorkoutSession) => {
  //   setTrackingSession(session);
  //   setIsTrackModalOpen(true);
  // };

  /*
  const handleGlobalWarmupCompleted = (sessionId: string, workoutName: string) => {
    markGlobalWarmupAsCompleted(sessionId);
    toast({
      title: "Aquecimento Geral Concluído!",
      description: `Aquecimento para ${workoutName} finalizado. Prossiga para os exercícios!`,
    });
  };

  const handleUndoGlobalWarmup = (sessionId: string, workoutName: string) => {
    undoGlobalWarmup(sessionId);
    toast({
      title: "Aquecimento Geral Desfeito!",
      description: `O estado do aquecimento para ${workoutName} foi revertido.`,
      variant: "default",
    });
  };
  */

  // const handleWorkoutFinallyCompleted = useCallback(() => {
  //   if (trackingSession) {
  //     // const workout = getWorkoutById(trackingSession.workoutId);
  //     // if (workout && workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) {
  //     // setWorkoutToUpdateDeadline(workout);
  //     // }
  //     toast({
  //       title: "Treino Finalizado!",
  //       description: `A sessão de ${trackingSession.workoutName} foi marcada como concluída e sua performance registrada.`,
  //     });
  //   }
  //   setTrackingSession(null);
  // }, [trackingSession, toast]);


  /*
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

  const handleDeleteSessionConfirm = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      toast({
        title: "Sessão Excluída",
        description: `A sessão de treino "${sessionToDelete.workoutName}" foi removida do histórico.`,
      });
      setSessionToDelete(null);
    }
  };
  */
  // const workoutForTrackingModal = undefined; // Temporary for testing parsing


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
              {/* <PlaceholderChart /> */}
              <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Gráfico em Breve (PlaceholderChart comentado)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <History className="text-primary" />
                Histórico de Treinos
              </Title>
              <CardDescription>Revise suas sessões de treino. Acompanhe, finalize ou remova treinos em aberto.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda. Inicie um treino da sua biblioteca!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {/* Session mapping logic commented out */}
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
          </Header>
          <CardContent>
            <p className="text-muted-foreground">Fique ligado para mais funcionalidades avançadas de acompanhamento de progresso!</p>
          </CardContent>
        </Card>

      </div>
      {/* Modals commented out */}
      {/* {workoutToUpdateDeadline && (
        <DeadlineUpdateModal
          isOpen={!!workoutToUpdateDeadline}
          onClose={() => setWorkoutToUpdateDeadline(null)}
          workout={workoutToUpdateDeadline}
          onSave={handleDeadlineSave}
        />
      )} */}
      {/*isTrackModalOpen && trackingSession && workoutForTrackingModal && (
        <TrackWorkoutModal
          isOpen={isTrackModalOpen}
          onClose={() => {
            setIsTrackModalOpen(false);
            // setTrackingSession(null); // Already handled by onWorkoutFinallyCompleted or direct close
          }}
          session={trackingSession}
          workout={workoutForTrackingModal as Workout} // Cast as Workout, assuming it won't be undefined if modal is open
          onWorkoutFinallyCompleted={() => { //handleWorkoutFinallyCompleted(); setTrackingSession(null);
        }}
        />
        )*/}
    </AppLayout>
  );
};
export default ProgressTrackingPage;
