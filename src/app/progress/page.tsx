
"use client";

import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, WorkoutSession, Exercise as WorkoutExerciseType } from '@/lib/types'; // Renomeado para evitar conflito
import { Play, Trash2, Flame, Undo2, BarChartHorizontalBig, Target } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrackWorkoutModal } from '@/components/TrackWorkoutModal';
import { DeadlineUpdateModal } from '@/components/DeadlineUpdateModal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";

interface MuscleGroupSummary {
  [groupName: string]: number;
}

// Helper function para calcular o resumo de séries por grupo muscular para um workout
function calculateWorkoutMuscleGroupSummary(workoutExercises: WorkoutExerciseType[]): MuscleGroupSummary {
  const summary: MuscleGroupSummary = {};
  if (!workoutExercises) return summary;

  workoutExercises.forEach(ex => {
    if (ex && ex.name && ex.name.trim() !== '' && typeof ex.sets === 'number' && ex.sets > 0) {
      (ex.muscleGroups || []).forEach(group => {
        summary[group] = (summary[group] || 0) + ex.sets;
      });
    }
  });
  return summary;
}


const ProgressTrackingPage = () => {
  const { sessions, getWorkoutById, deleteSession, markGlobalWarmupAsCompleted, undoGlobalWarmup, updateWorkout } = useAppContext();
  const { toast } = useToast();

  const [trackingSession, setTrackingSession] = useState<WorkoutSession | null>(null);
  const [workoutForTrackingModal, setWorkoutForTrackingModal] = useState<Workout | undefined>(undefined);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const [workoutToUpdateDeadline, setWorkoutToUpdateDeadline] = useState<Workout | null>(null);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteDialogDescriptionId = useId();


  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [sessions]);

  const openTrackWorkoutModal = (session: WorkoutSession) => {
    const workout = getWorkoutById(session.workoutId);
    if (workout) {
      setTrackingSession(session);
      setIsTrackModalOpen(true);
    } else {
      toast({
        title: "Erro",
        description: "Detalhes do treino não encontrados para esta sessão.",
        variant: "destructive",
      });
    }
  };

  const handleGlobalWarmupCompleted = (sessionId: string) => {
    markGlobalWarmupAsCompleted(sessionId);
    toast({ title: "Aquecimento Global Concluído!", description: "Você marcou o aquecimento geral como feito." });
  };

  const handleUndoGlobalWarmup = (sessionId: string) => {
    undoGlobalWarmup(sessionId);
    toast({ title: "Aquecimento Global Desfeito", description: "O aquecimento geral foi marcado como pendente." });
  };

  const handleWorkoutFinallyCompleted = useCallback(() => {
    if (trackingSession) {
      const workout = getWorkoutById(trackingSession.workoutId);
      if (workout?.daysForDeadline && workout.daysForDeadline > 0) {
        setWorkoutToUpdateDeadline(workout);
        setIsDeadlineModalOpen(true);
      } else if (workout?.deadline) { // If it had a deadline but no daysForDeadline
         toast({
          title: "Treino Concluído!",
          description: `${workout.name} finalizado. O deadline pode precisar ser ajustado manualmente no construtor.`,
          duration: 5000,
        });
        setTrackingSession(null); 
      } else if (workout) {
         toast({
          title: "Treino Concluído!",
          description: `${workout.name} finalizado.`,
        });
        setTrackingSession(null);
      }
    }
  }, [trackingSession, getWorkoutById, toast]);


  const handleDeadlineSave = (updatedWorkoutId: string, newDeadline?: Date) => {
    const workoutToUpdate = getWorkoutById(updatedWorkoutId);
    if (workoutToUpdate) {
      const updatedW: Workout = {
        ...workoutToUpdate,
        deadline: newDeadline ? newDeadline.toISOString() : undefined,
      };
      updateWorkout(updatedW);
      toast({
        title: "Deadline Atualizado!",
        description: `O deadline para "${workoutToUpdate.name}" foi ${newDeadline ? 'definido' : 'removido'}.`,
      });
    }
    setIsDeadlineModalOpen(false);
    setWorkoutToUpdateDeadline(null);
    setTrackingSession(null); 
  };

  const handleDeleteSessionConfirm = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      toast({
        title: "Sessão Excluída",
        description: `A sessão de ${sessionToDelete.workoutName} foi excluída.`,
      });
      setSessionToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (trackingSession) {
        const workout = getWorkoutById(trackingSession.workoutId);
        setWorkoutForTrackingModal(workout);
    } else {
        setWorkoutForTrackingModal(undefined);
    }
  }, [trackingSession, getWorkoutById]);


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Acompanhamento de Progresso</h1>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resumo Geral</CardTitle>
            <CardDescription>
              Acompanhe seu progresso, veja sessões concluídas e continue treinos em andamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 text-center text-sm text-muted-foreground">
              [Gráfico de Progresso - Em breve]
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Histórico de Treinos</CardTitle>
            <CardDescription>
              Sessões recentes. Treinos em andamento podem ser continuados aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedSessions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda.</p>
            ) : (
              <ul className="space-y-6">
                {sortedSessions.map((session, index_map) => {
                  const workout = getWorkoutById(session.workoutId);
                  const isGlobalWarmupApplicable = workout?.hasGlobalWarmup === true;
                  const canUndoGlobalWarmup = isGlobalWarmupApplicable && session.isGlobalWarmupCompleted === true && !session.isCompleted;
                  const canCompleteGlobalWarmup = isGlobalWarmupApplicable && session.isGlobalWarmupCompleted === false && !session.isCompleted;
                  
                  const muscleSummary = workout ? calculateWorkoutMuscleGroupSummary(workout.exercises) : {};

                  let progressPercent = 0;
                  if (workout && session.exercisePerformances) {
                      const totalSteps = workout.exercises.reduce((acc, ex) => acc + (ex.hasWarmup ? 2 : 1), 0) + (isGlobalWarmupApplicable ? 1 : 0);
                      let completedSteps = 0;
                      if (isGlobalWarmupApplicable && session.isGlobalWarmupCompleted) {
                          completedSteps++;
                      }
                      session.exercisePerformances.forEach(p => {
                          if (p.hasWarmup && p.isWarmupCompleted) completedSteps++;
                          if (p.isExerciseCompleted) completedSteps++;
                      });
                      if (totalSteps > 0) {
                          progressPercent = Math.round((completedSteps / totalSteps) * 100);
                      } else if (session.isCompleted) {
                          progressPercent = 100;
                      }
                  }


                  return (
                    <li key={session.id} className="p-4 border rounded-md shadow-sm bg-card">
                       <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3 sm:gap-4">
                        <div className="flex-grow order-2 sm:order-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-semibold font-headline">{session.workoutName}</h3>
                            {session.isCompleted ? (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-primary-foreground">Concluído</Badge>
                            ) : (
                              <Badge variant="destructive">Em Andamento</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Data: {format(parseISO(session.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {workout?.description && <p className="text-xs italic text-muted-foreground">{workout.description}</p>}

                           {!session.isCompleted && workout && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-muted-foreground">Progresso:</span>
                                    <span className="text-xs font-semibold text-primary">{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-2" />
                            </div>
                           )}

                          {session.notes && !session.isCompleted && <p className="text-xs text-muted-foreground mt-1.5">Última Nota: {session.notes.split('.').slice(-2).join('.').trim() || session.notes}</p>}
                          
                          {workout && Object.keys(muscleSummary).length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <h4 className="text-xs font-semibold mb-1 text-muted-foreground flex items-center gap-1">
                                   <Target className="h-3 w-3" /> Séries Planejadas por Grupo:
                                </h4>
                                <ul className="text-xs text-muted-foreground space-y-0.5 grid grid-cols-2 sm:grid-cols-3 gap-x-2">
                                {Object.entries(muscleSummary)
                                    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
                                    .map(([group, count]) => (
                                    <li key={group}>
                                        <span className="font-medium text-foreground/80">{group}:</span> {count}
                                    </li>
                                    ))}
                                </ul>
                            </div>
                          )}

                        </div>

                        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                          {!session.isCompleted && workout && (
                            <>
                              {canCompleteGlobalWarmup && (
                                <Button size="sm" variant="outline" onClick={() => handleGlobalWarmupCompleted(session.id)} title="Marcar aquecimento global como concluído">
                                  <Flame className="mr-2 h-4 w-4 text-orange-500" /> Aquecimento Global
                                </Button>
                              )}
                               <Button size="sm" onClick={() => openTrackWorkoutModal(session)} title="Continuar acompanhando o treino">
                                <Play className="mr-2 h-4 w-4" /> Acompanhar
                              </Button>
                              {canUndoGlobalWarmup && (
                                <Button size="sm" variant="ghost" onClick={() => handleUndoGlobalWarmup(session.id)} title="Desfazer conclusão do aquecimento global">
                                  <Undo2 className="mr-2 h-4 w-4" /> Desfazer Aquecimento
                                </Button>
                              )}
                            </>
                          )}
                          <AlertDialog open={isDeleteDialogOpen && sessionToDelete?.id === session.id} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" title="Excluir sessão" onClick={() => { setSessionToDelete(session); setIsDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription id={deleteDialogDescriptionId}>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a sessão de treino de "{session.workoutName}" iniciada em {format(parseISO(session.date), "dd/MM/yyyy 'às' HH:mm")}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSessionConfirm}>
                                  Excluir Sessão
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {index_map < sortedSessions.length - 1 && <Separator className="mt-6" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {trackingSession && workoutForTrackingModal && (
        <TrackWorkoutModal
          isOpen={isTrackModalOpen}
          onClose={() => {
            setIsTrackModalOpen(false);
          }}
          session={trackingSession}
          workout={workoutForTrackingModal}
          onWorkoutFinallyCompleted={handleWorkoutFinallyCompleted}
        />
      )}

      {workoutToUpdateDeadline && (
        <DeadlineUpdateModal
          isOpen={isDeadlineModalOpen}
          onClose={() => {
            setIsDeadlineModalOpen(false);
            setWorkoutToUpdateDeadline(null);
            setTrackingSession(null); 
          }}
          workout={workoutToUpdateDeadline}
          onSave={handleDeadlineSave}
        />
      )}
    </AppLayout>
  );
};
export default ProgressTrackingPage;

