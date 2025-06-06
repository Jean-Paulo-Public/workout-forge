"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import type { ScheduledWorkout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, setHours, setMinutes, setSeconds, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock, Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { useSearchParams } from 'next/navigation';

export default function SchedulerPage() {
  const { workouts, scheduledWorkouts, addScheduledWorkout, deleteScheduledWorkout } = useAppContext();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("08:00");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | undefined>(searchParams.get('workoutId') || undefined);
  
  useEffect(() => {
    const workoutId = searchParams.get('workoutId');
    if (workoutId) {
      setSelectedWorkoutId(workoutId);
    }
  }, [searchParams]);

  const handleScheduleWorkout = () => {
    if (!selectedDate || !selectedWorkoutId) {
      toast({
        title: "Informação Faltando",
        description: "Por favor, selecione uma data e um treino.",
        variant: "destructive",
      });
      return;
    }

    const workout = workouts.find(w => w.id === selectedWorkoutId);
    if (!workout) {
      toast({
        title: "Treino Não Encontrado",
        description: "O treino selecionado não pôde ser encontrado.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledDateTime = setSeconds(setMinutes(setHours(selectedDate, hours), minutes),0);

    addScheduledWorkout({
      workoutId: workout.id,
      workoutName: workout.name,
      dateTime: scheduledDateTime.toISOString(),
    });

    toast({
      title: "Treino Agendado!",
      description: `${workout.name} agendado para ${format(scheduledDateTime, "PPPp", { locale: ptBR })}.`,
    });
    setSelectedWorkoutId(undefined);
  };

  const handleDeleteScheduled = (id: string) => {
    deleteScheduledWorkout(id);
    toast({
      title: "Agendamento Removido",
      description: "O treino foi desagendado.",
    });
  };

  const sortedScheduledWorkouts = [...scheduledWorkouts].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Agendador de Treinos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Agendar Novo Treino</CardTitle>
            <CardDescription>Escolha um treino, data e hora para sua próxima sessão.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border self-start"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                locale={ptBR}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="workout-select" className="block text-sm font-medium mb-1">Selecionar Treino</label>
                <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                  <SelectTrigger id="workout-select">
                    <SelectValue placeholder="Escolha um treino" />
                  </SelectTrigger>
                  <SelectContent>
                    {workouts.length > 0 ? workouts.map((workout) => (
                      <SelectItem key={workout.id} value={workout.id}>
                        {workout.name}
                      </SelectItem>
                    )) : <SelectItem value="no-workouts" disabled>Nenhum treino na biblioteca</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="time-select" className="block text-sm font-medium mb-1">Selecionar Hora</label>
                <Input 
                  id="time-select" 
                  type="time" 
                  value={selectedTime} 
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleScheduleWorkout} disabled={!selectedDate || !selectedWorkoutId || workouts.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agendar Treino
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <CalendarClock className="text-primary" /> Próximos Treinos Agendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedScheduledWorkouts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum treino agendado ainda.</p>
            ) : (
              <ul className="space-y-3">
                {sortedScheduledWorkouts.map((sw) => (
                  <li key={sw.id} className="flex justify-between items-center p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-semibold">{sw.workoutName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(sw.dateTime), "EEE, dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Remover do agendamento">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso removerá "{sw.workoutName}" do seu agendamento. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteScheduled(sw.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
