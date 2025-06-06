"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, Trash2, Play, Eye, CalendarPlus } from 'lucide-react';
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
  const { workouts, deleteWorkout, addSession } = useAppContext();
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

  const handleStartWorkout = (workout: Workout) => {
    addSession({
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      notes: `Iniciou ${workout.name}.`
    });
    toast({
      title: "Treino Iniciado!",
      description: `${workout.name} foi registrado como iniciado. Acompanhe seu progresso!`,
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
                    {workout.exercises.slice(0,5).map((exercise) => (
                      <li key={exercise.id}>{formatExerciseDisplay(exercise)}</li>
                    ))}
                    {workout.exercises.length > 5 && <li>...e mais {workout.exercises.length - 5}</li>}
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
                <div key={ex.id} className="text-sm border-b pb-2">
                  <p className="font-medium">{idx + 1}. {ex.name}</p>
                  <p className="text-muted-foreground">Séries: {ex.sets}, Reps: {ex.reps}</p>
                  {ex.weight && <p className="text-xs text-muted-foreground">Peso: {ex.weight}</p>}
                  {ex.notes && <p className="text-xs text-muted-foreground italic">Notas: {ex.notes}</p>}
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
