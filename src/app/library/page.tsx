
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, Trash2, Play, Eye, Target, Flame, Edit, Repeat, AlertTriangle, CalendarDays, LayoutGrid, ListOrdered, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
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
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { WorkoutTemplateSelectionModal } from '@/components/WorkoutTemplateSelectionModal';
import { ConfirmScheduleModal } from '@/components/ConfirmScheduleModal';
import { generateWorkoutFromTemplate } from '@/lib/workout-templates';
import { Separator } from '@/components/ui/separator';

interface MuscleGroupSummary {
  [groupName: string]: number;
}

export default function WorkoutLibraryPage() {
  const { workouts, deleteWorkout, addSession, getWorkoutById, hasActiveSession, userSettings, addWorkout: addContextWorkout, updateWorkoutsOrder } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [isConfirmScheduleModalOpen, setIsConfirmScheduleModalOpen] = useState(false);
  const [generatedWorkoutForConfirmation, setGeneratedWorkoutForConfirmation] = useState<Omit<Workout, 'id'> | null>(null);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<{deadline?: string, frequency?: number}>({});

  const [isReorderingActive, setIsReorderingActive] = useState(false);
  const [orderedWorkouts, setOrderedWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (!isReorderingActive) {
      setOrderedWorkouts([...workouts]);
    }
  }, [workouts, isReorderingActive]);


  const handleDeleteWorkout = (workoutId: string) => {
    deleteWorkout(workoutId);
    toast({
      title: "Treino Excluído",
      description: "O treino foi removido da sua biblioteca.",
    });
  };

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

  const handleEditWorkout = (workoutId: string) => {
    router.push(`/builder?editId=${workoutId}`);
  };

  const formatExerciseDisplay = (exercise: Exercise) => {
    let display = `${exercise.name} (${exercise.sets} séries x ${exercise.reps})`;
    if (exercise.weight) {
      display += ` - Peso: ${exercise.weight}`;
    }
    if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
      display += ` (Músculos: ${exercise.muscleGroups.join(', ')})`;
    }
     if (exercise.hasWarmup) {
      display += ` (Aquecimento incluído)`;
    }
    if (exercise.notes) {
      display += ` (Obs: ${exercise.notes.substring(0, 30)}...)`;
    }
    return display;
  };

  const calculateMuscleGroupSummary = (workout: Workout): MuscleGroupSummary => {
    const summary: MuscleGroupSummary = {};
    workout.exercises.forEach(ex => {
      ex.muscleGroups?.forEach(group => {
        summary[group] = (summary[group] || 0) + ex.sets;
      });
    });
    return summary;
  };

  const handleSelectWorkoutTemplate = (templateKey: string) => {
    const generationResult = generateWorkoutFromTemplate(templateKey, userSettings, workouts);
    if (generationResult) {
      setGeneratedWorkoutForConfirmation(generationResult.workoutData);
      setScheduleSuggestions({
        deadline: generationResult.suggestedDeadlineISO,
        frequency: generationResult.suggestedFrequencyDays
      });
      setIsConfirmScheduleModalOpen(true);
    } else {
      toast({
        title: "Erro ao Gerar Treino",
        description: "Não foi possível gerar o treino a partir do modelo selecionado.",
        variant: "destructive"
      });
    }
    setIsTemplateModalOpen(false); 
  };

  const handleConfirmSchedule = (useSuggestions: boolean) => {
    if (generatedWorkoutForConfirmation) {
      let workoutToAdd = { ...generatedWorkoutForConfirmation };
      if (useSuggestions) {
        workoutToAdd.deadline = scheduleSuggestions.deadline;
        workoutToAdd.repeatFrequencyDays = scheduleSuggestions.frequency;
      } else {
        workoutToAdd.deadline = undefined;
        workoutToAdd.repeatFrequencyDays = undefined;
      }
      addContextWorkout(workoutToAdd);
      toast({
        title: "Treino Adicionado!",
        description: `O treino "${workoutToAdd.name}" foi adicionado à sua biblioteca.`
      });
    }
    setIsConfirmScheduleModalOpen(false);
    setGeneratedWorkoutForConfirmation(null);
    setScheduleSuggestions({});
  };

  const handleToggleReorderMode = () => {
    if (isReorderingActive) {
      setIsReorderingActive(false);
    } else {
      setOrderedWorkouts([...workouts]); 
      setIsReorderingActive(true);
    }
  };

  const handleSaveOrder = () => {
    updateWorkoutsOrder(orderedWorkouts);
    setIsReorderingActive(false);
    toast({ title: "Ordem Salva", description: "A nova ordem dos treinos foi salva." });
  };

  const moveWorkoutInList = (index: number, direction: 'up' | 'down') => {
    const newOrderedList = [...orderedWorkouts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrderedList.length) {
      return; 
    }
    [newOrderedList[index], newOrderedList[targetIndex]] = [newOrderedList[targetIndex], newOrderedList[index]];
    setOrderedWorkouts(newOrderedList);
  };

  const workoutsToDisplay = isReorderingActive ? orderedWorkouts : workouts;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-y-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Treinos</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              className="w-full sm:w-auto" 
              variant="outline" 
              onClick={() => setIsTemplateModalOpen(true)}
              disabled={isReorderingActive}
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Adicionar via Modelo
            </Button>
            <Link href="/builder" className={`w-full sm:w-auto ${isReorderingActive ? "pointer-events-none" : ""}`}>
              <Button className="w-full sm:w-auto" disabled={isReorderingActive}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Treino
              </Button>
            </Link>
             <Button
              variant="outline"
              onClick={handleToggleReorderMode}
              className="w-full sm:w-auto"
            >
              {isReorderingActive ? <X className="mr-2 h-4 w-4" /> : <ListOrdered className="mr-2 h-4 w-4" />}
              {isReorderingActive ? "Cancelar Reordenação" : "Reordenar Treinos"}
            </Button>
            {isReorderingActive && (
              <Button onClick={handleSaveOrder} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                Salvar Ordem
              </Button>
            )}
          </div>
        </div>

        {workoutsToDisplay.length === 0 && !isReorderingActive ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline">Sua Biblioteca está Vazia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro plano de treino usando o Construtor de Treinos ou adicione um treino modelo.
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplateModalOpen(true)}
                >
                   <LayoutGrid className="mr-2 h-4 w-4" /> Adicionar via Modelo
                </Button>
                <Link href="/builder">
                  <Button variant="default">Ir para o Construtor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workoutsToDisplay.map((workout, index) => {
              const isActive = hasActiveSession(workout.id);
              return (
              <Card key={workout.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-headline">{workout.name}</CardTitle>
                    {!isReorderingActive && isActive && <Badge variant="destructive" className="text-xs ml-2">ATIVO</Badge>}
                  </div>
                  {workout.description && (
                    <CardDescription>{workout.description}</CardDescription>
                  )}
                   {workout.repeatFrequencyDays && (
                    <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
                      <Repeat className="h-3 w-3 mr-1" /> Repetir a cada {workout.repeatFrequencyDays} dia(s)
                    </CardDescription>
                  )}
                  {workout.deadline && (
                    <CardDescription className="text-xs text-muted-foreground flex items-center mt-1">
                      <CalendarDays className="h-3 w-3 mr-1 text-blue-500" /> Deadline: {format(parseISO(workout.deadline), "dd/MM/yyyy", { locale: ptBR })}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="font-medium mb-1 text-sm">Exercícios:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {workout.exercises.slice(0,3).map((exercise) => (
                      <li key={exercise.id} className="truncate" title={formatExerciseDisplay(exercise)}>
                        {exercise.hasWarmup && <Flame className="inline h-3 w-3 mr-1 text-orange-500" title="Aquecimento para este exercício incluído" />}
                        {exercise.name} ({exercise.sets}x{exercise.reps})
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 &&
                          <span className="text-xs ml-1">({exercise.muscleGroups.slice(0,2).join(', ')}{exercise.muscleGroups.length > 2 ? '...' : ''})</span>}
                      </li>
                    ))}
                    {workout.exercises.length > 3 && <li>...e mais {workout.exercises.length - 3}</li>}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-end">
                  {isReorderingActive ? (
                     <div className="flex w-full justify-end items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveWorkoutInList(index, 'up')}
                            disabled={index === 0}
                            title="Mover treino para cima"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveWorkoutInList(index, 'down')}
                            disabled={index === workoutsToDisplay.length - 1}
                            title="Mover treino para baixo"
                        >
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorkout(workout)}>
                        <Eye className="mr-1 h-4 w-4" /> Visualizar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEditWorkout(workout.id)}>
                        <Edit className="mr-1 h-4 w-4" /> Editar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStartWorkout(workout)}
                        disabled={isActive}
                        title={isActive ? "Este treino já está em andamento" : "Iniciar treino"}
                      >
                        <Play className="mr-1 h-4 w-4" /> {isActive ? "Em Andamento" : "Iniciar"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" title="Excluir Treino">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o treino "{workout.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </CardFooter>
              </Card>
            )})}
          </div>
        )}
      </div>

      {selectedWorkout && (
        <AlertDialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
               <div className="flex justify-between items-start">
                <AlertDialogTitle className="font-headline">{selectedWorkout.name}</AlertDialogTitle>
                {hasActiveSession(selectedWorkout.id) && <Badge variant="destructive" className="text-xs mt-1 ml-2">ATIVO</Badge>}
              </div>
              {selectedWorkout.description && (
                <AlertDialogDescription>{selectedWorkout.description}</AlertDialogDescription>
              )}
               {selectedWorkout.repeatFrequencyDays && (
                <AlertDialogDescription className="text-xs text-muted-foreground flex items-center mt-1">
                  <Repeat className="h-3 w-3 mr-1" /> Repetir a cada {selectedWorkout.repeatFrequencyDays} dia(s) após conclusão.
                </AlertDialogDescription>
              )}
              {selectedWorkout.deadline && (
                <AlertDialogDescription className="text-xs text-muted-foreground flex items-center mt-1">
                  <CalendarDays className="h-3 w-3 mr-1 text-blue-500" /> Deadline: {format(parseISO(selectedWorkout.deadline), "dd/MM/yyyy", { locale: ptBR })}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 py-4">
              <div>
                <h4 className="font-semibold text-md mb-2">Exercícios:</h4>
                {selectedWorkout.exercises.map((ex, idx) => (
                  <div key={ex.id} className="text-sm border-b pb-2 mb-2">
                    <p className="font-medium">
                      {ex.hasWarmup && <Flame className="inline h-4 w-4 mr-1 text-orange-500" title="Série de aquecimento incluída" />}
                      {idx + 1}. {ex.name}
                    </p>
                    <p className="text-muted-foreground">Séries: {ex.sets}, Reps: {ex.reps}</p>
                    {ex.weight && <p className="text-xs text-muted-foreground">Peso: {ex.weight}</p>}
                    {ex.muscleGroups && ex.muscleGroups.length > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Target className="h-3 w-3" />
                        {ex.muscleGroups.join(', ')}
                      </p>
                    )}
                    {ex.notes && <p className="text-xs text-muted-foreground italic mt-1">Obs: {ex.notes}</p>}
                  </div>
                ))}
              </div>
              <Separator className="my-3"/>
              <div>
                <h4 className="font-semibold text-md mb-1">Resumo de Séries por Grupo Muscular:</h4>
                {Object.entries(calculateMuscleGroupSummary(selectedWorkout)).length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                    {Object.entries(calculateMuscleGroupSummary(selectedWorkout))
                      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
                      .map(([group, count]) => (
                        <li key={group}>{group}: {count} séries</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum grupo muscular definido para os exercícios deste treino.</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedWorkout(null)}>Fechar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleStartWorkout(selectedWorkout);
                  setSelectedWorkout(null);
                }}
                disabled={hasActiveSession(selectedWorkout.id)}
                title={hasActiveSession(selectedWorkout.id) ? "Este treino já está em andamento" : "Iniciar treino"}
              >
                <Play className="mr-1 h-4 w-4" /> {hasActiveSession(selectedWorkout.id) ? "Em Andamento" : "Iniciar Treino"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <WorkoutTemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectWorkoutTemplate}
      />

      {generatedWorkoutForConfirmation && (
        <ConfirmScheduleModal
          isOpen={isConfirmScheduleModalOpen}
          onClose={() => {
            setIsConfirmScheduleModalOpen(false);
            setGeneratedWorkoutForConfirmation(null);
            setScheduleSuggestions({});
          }}
          workoutName={generatedWorkoutForConfirmation.name}
          suggestedDeadlineISO={scheduleSuggestions.deadline}
          suggestedFrequencyDays={scheduleSuggestions.frequency}
          onConfirm={handleConfirmSchedule}
        />
      )}
    </AppLayout>
  );
}
