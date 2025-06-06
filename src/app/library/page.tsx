
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, Trash2, Play, Eye, CalendarPlus, Target, Flame } from 'lucide-react';
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

export default function WorkoutLibraryPage() {
  const { workouts, deleteWorkout, addSession, getWorkoutById } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const handleDeleteWorkout = (workoutId: string) => {
    deleteWorkout(workoutId);
    toast({
      title: "Treino Excluído",
      description: "O treino foi removido da sua biblioteca.",
    });
  };

  const handleStartWorkout = (workoutToStart: Workout) => {
    // Make sure we have the latest workout data, especially for exercises and hasWarmup
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
      // Notes will be set within addSession based on warmup status of the first exercise
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-y-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Treinos</h1>
          <Link href="/builder" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Treino
            </Button>
          </Link>
        </div>

        {workouts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline">Sua Biblioteca está Vazia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro plano de treino usando o Construtor de Treinos.
              </p>
              <Link href="/builder">
                <Button variant="outline">Ir para o Construtor</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">{workout.name}</CardTitle>
                  {workout.description && (
                    <CardDescription>{workout.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="font-medium mb-1 text-sm">Exercícios:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {workout.exercises.slice(0,3).map((exercise) => ( 
                      <li key={exercise.id} className="truncate" title={formatExerciseDisplay(exercise)}>
                        {exercise.hasWarmup && <Flame className="inline h-3 w-3 mr-1 text-orange-500" />}
                        {exercise.name} ({exercise.sets}x{exercise.reps})
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && 
                          <span className="text-xs ml-1">({exercise.muscleGroups.slice(0,2).join(', ')}{exercise.muscleGroups.length > 2 ? '...' : ''})</span>}
                      </li>
                    ))}
                    {workout.exercises.length > 3 && <li>...e mais {workout.exercises.length - 3}</li>}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedWorkout(workout)}>
                    <Eye className="mr-1 h-4 w-4" /> Visualizar
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleStartWorkout(workout)}>
                    <Play className="mr-1 h-4 w-4" /> Iniciar
                  </Button>
                   <Button variant="secondary" size="sm" onClick={() => handleScheduleWorkout(workout)}>
                    <CalendarPlus className="mr-1 h-4 w-4" /> Agendar
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
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedWorkout && (
        <AlertDialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">{selectedWorkout.name}</AlertDialogTitle>
              {selectedWorkout.description && (
                <AlertDialogDescription>{selectedWorkout.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 py-4">
              <h4 className="font-semibold text-md">Exercícios:</h4>
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
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedWorkout(null)}>Fechar</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleStartWorkout(selectedWorkout);
                setSelectedWorkout(null);
              }}>
                <Play className="mr-1 h-4 w-4" /> Iniciar Treino
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppLayout>
  );
}
