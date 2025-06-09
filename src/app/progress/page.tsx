
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, History, TrendingUp, CheckCircle2, PlayCircle, Flame, Trash2, Undo2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useState, useCallback, useId, useMemo } from 'react';
import type { Workout, WorkoutSession, SessionExercisePerformance } from '@/lib/types';
import { DeadlineUpdateModal } from '@/components/DeadlineUpdateModal';
import { TrackWorkoutModal } from '@/components/TrackWorkoutModal';
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

const PlaceholderChart = () => (
  <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
    <BarChart3 className="h-16 w-16 text-muted-foreground" />
    <p className="ml-2 text-muted-foreground">Gráfico em Breve</p>
  </div>
);

export default function ProgressTrackingPage() {
  const { sessions, getWorkoutById, updateWorkout, markGlobalWarmupAsCompleted, undoGlobalWarmup, deleteSession } = useAppContext();
  const { toast } = useToast();
  const [workoutToUpdateDeadline, setWorkoutToUpdateDeadline] = useState<Workout | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  const deleteDialogDescriptionId = useId();

  const [trackingSession, setTrackingSession] = useState<WorkoutSession | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const workoutForTrackingModal = trackingSession ? getWorkoutById(trackingSession.workoutId) : undefined;

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      // Prioridade 1: Sessões não concluídas primeiro
      if (!a.isCompleted && b.isCompleted) {
        return -1;
      }
      if (a.isCompleted && !b.isCompleted) {
        return 1;
      }
      // Se ambas têm o mesmo status de 'isCompleted' (ambas não concluídas ou ambas concluídas)
      // Ordenar por data mais recente primeiro
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [sessions]);

  const openTrackWorkoutModal = (session: WorkoutSession) => {
    setTrackingSession(session);
    setIsTrackModalOpen(true);
  };

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

  const handleWorkoutFinallyCompleted = useCallback(() => {
    if (trackingSession) {
        const workout = getWorkoutById(trackingSession.workoutId);
        if (workout && workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) {
            setWorkoutToUpdateDeadline(workout);
        }
        toast({
            title: "Treino Finalizado!",
            description: `A sessão de ${trackingSession.workoutName} foi marcada como concluída e sua performance registrada.`,
        });
    }
    setTrackingSession(null);
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
              <CardDescription>Revise suas sessões de treino. Acompanhe, finalize ou remova treinos em aberto.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda. Inicie um treino da sua biblioteca!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {sortedSessions.map(session => {
                      const workoutDetails = getWorkoutById(session.workoutId);
                      const isWorkoutDeleted = !workoutDetails;
                      const displayName = isWorkoutDeleted ? `${session.workoutName} (Treino Excluído)` : session.workoutName;
                      
                      const hasGlobalWarmup = workoutDetails?.hasGlobalWarmup;

                      return (
                      <li key={session.id} className="p-3 border rounded-md bg-card hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                          {/* Botões de Ação - Order 1 em mobile, Order 2 em sm+ */}
                          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto order-1 sm:order-2">
                            {!session.isCompleted && !isWorkoutDeleted ? (
                              <>
                                {hasGlobalWarmup && session.isGlobalWarmupCompleted ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openTrackWorkoutModal(session)}
                                      className="whitespace-nowrap"
                                    >
                                      <PlayCircle className="mr-2 h-4 w-4 text-primary-foreground" /> Acompanhar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUndoGlobalWarmup(session.id, session.workoutName)}
                                      className="whitespace-nowrap"
                                      title="Desfazer aquecimento global"
                                    >
                                      <Undo2 className="mr-2 h-4 w-4" /> Desfazer Aquecimento
                                    </Button>
                                  </>
                                ) : hasGlobalWarmup && !session.isGlobalWarmupCompleted ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGlobalWarmupCompleted(session.id, session.workoutName)}
                                    className="whitespace-nowrap"
                                  >
                                    <Flame className="mr-2 h-4 w-4 text-orange-500" /> Concluir Aquecimento
                                  </Button>
                                ) : ( // Não tem aquecimento global
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openTrackWorkoutModal(session)}
                                      className="whitespace-nowrap"
                                    >
                                      <PlayCircle className="mr-2 h-4 w-4 text-primary-foreground" /> Acompanhar
                                    </Button>
                                )}
                               
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setSessionToDelete(session)}
                                    title="Excluir sessão não concluída"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                {sessionToDelete && sessionToDelete.id === session.id && (
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Sessão de Treino?</AlertDialogTitle>
                                      <AlertDialogDescription id={deleteDialogDescriptionId}>
                                        Você tem certeza que deseja excluir esta sessão de treino iniciada para "{sessionToDelete.workoutName}"? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDeleteSessionConfirm}>
                                        Excluir Sessão
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                )}
                              </AlertDialog>
                              </>
                            ) : (
                              session.isCompleted && (
                                <span className="text-xs text-green-600 font-medium flex items-center whitespace-nowrap">
                                  <CheckCircle2 className="mr-1 h-4 w-4" /> Concluído
                                </span>
                              )
                            )}
                          </div>

                           {/* Informações do Treino - Order 2 em mobile, Order 1 em sm+ */}
                          <div className="flex-grow order-2 sm:order-1">
                            <p className="font-semibold">{displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              Iniciado em: {format(new Date(session.date), 'PPP p', { locale: ptBR })}
                            </p>
                            {session.notes && <p className="text-xs italic mt-1 text-muted-foreground">{session.notes}</p>}
                          </div>

                        </div>
                        {session.isCompleted && session.exercisePerformances && session.exercisePerformances.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <h4 className="text-xs font-semibold mb-1">Performance Registrada:</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                              {session.exercisePerformances.map(perf => (
                                <li key={perf.exerciseId}>
                                  {perf.exerciseName}: {perf.weightUsed || 'N/A'}
                                  {perf.hasWarmup && perf.isWarmupCompleted ? ' (Aquec. ✓)' : ''}
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
          </Header>
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
             // Mantém trackingSession para caso o modal seja reaberto, dados não são perdidos até a conclusão final.
          }}
          session={trackingSession}
          workout={workoutForTrackingModal}
          onWorkoutFinallyCompleted={handleWorkoutFinallyCompleted}
        />
      )}
    </AppLayout>
  );
}
