
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LibraryBig, TrendingUp, Settings, Save, Dumbbell, BarChartHorizontalBig, AlarmClock } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const userSettingsSchema = z.object({
  defaultSets: z.coerce.number().min(1, "Séries devem ser pelo menos 1."),
  defaultReps: z.string().min(1, "Repetições são obrigatórias."),
  defaultRestAlarmSeconds: z.coerce.number().min(10, "O alarme de descanso deve ser de pelo menos 10 segundos.").max(600, "O alarme de descanso não pode exceder 600 segundos (10 minutos)."),
});

type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

interface WeeklyMuscleSummary {
  [groupName: string]: number;
}

export default function DashboardPage() {
  const { workouts, sessions, userSettings, updateUserSettings, getWorkoutById } = useAppContext();
  const { toast } = useToast();

  const settingsForm = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      defaultSets: userSettings.defaultSets,
      defaultReps: userSettings.defaultReps,
      defaultRestAlarmSeconds: userSettings.defaultRestAlarmSeconds,
    },
  });

  function onSettingsSubmit(values: UserSettingsFormData) {
    updateUserSettings(values);
    toast({
      title: "Configurações Salvas!",
      description: "Suas configurações padrão de treino foram atualizadas.",
    });
  }
  
  useEffect(() => {
    settingsForm.reset({
      defaultSets: userSettings.defaultSets,
      defaultReps: userSettings.defaultReps,
      defaultRestAlarmSeconds: userSettings.defaultRestAlarmSeconds,
    });
  }, [userSettings, settingsForm]);

  const weeklyMuscleGroupSummary = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1, locale: ptBR }); // Segunda-feira
    const weekEnd = endOfWeek(today, { weekStartsOn: 1, locale: ptBR });     // Domingo

    const summary: WeeklyMuscleSummary = {};

    const completedSessionsThisWeek = sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return session.isCompleted && isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });

    completedSessionsThisWeek.forEach(session => {
      const workoutDetails = getWorkoutById(session.workoutId);
      if (workoutDetails) {
        session.exercisePerformances.forEach(perf => {
          if (perf.isExerciseCompleted) {
            const exerciseInWorkout = workoutDetails.exercises.find(ex => ex.id === perf.exerciseId);
            if (exerciseInWorkout && exerciseInWorkout.muscleGroups) {
              exerciseInWorkout.muscleGroups.forEach(group => {
                summary[group] = (summary[group] || 0) + exerciseInWorkout.sets;
              });
            }
          }
        });
      }
    });
    return summary;
  }, [sessions, getWorkoutById]);


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Painel</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                 <Dumbbell className="text-primary"/> Bem-vindo ao Workout Forge!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pronto para construir, acompanhar e otimizar sua jornada de fitness? Vamos começar.
              </p>
              <Link href="/builder">
                <Button>Criar Novo Treino</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <LibraryBig className="text-primary" />
                    Treinos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-2">Você tem {workouts.length} treino(s) salvo(s).</p>
                <Link href="/library">
                    <Button variant="outline" size="sm">Ir para Treinos</Button>
                </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <TrendingUp className="text-primary" />
                    Atividade Recente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-2">Você completou {sessions.filter(s => s.isCompleted).length} sessão(ões) e tem {sessions.filter(s => !s.isCompleted).length} em andamento.</p>
                 <Link href="/progress">
                    <Button variant="outline" size="sm">Ver Progresso</Button>
                </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Settings className="text-primary" />
                Configurações Padrão
              </CardTitle>
              <CardDescription>Defina padrões para novos exercícios e tempo de alarme para descanso.</CardDescription>
            </CardHeader>
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="defaultSets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Séries Padrão</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ex: 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
                    name="defaultReps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repetições Padrão</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 8-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
                    name="defaultRestAlarmSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo Padrão Alarme de Descanso (segundos)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ex: 180" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tempo padrão (em segundos) para o alarme no cronômetro de descanso entre séries. (Mín: 10s, Máx: 600s)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

           <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <BarChartHorizontalBig className="text-primary" />
                Resumo Semanal de Séries (Exercícios Concluídos)
              </CardTitle>
              <CardDescription>Total de séries por grupo muscular realizadas em treinos concluídos esta semana (Seg-Dom).</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(weeklyMuscleGroupSummary).length > 0 ? (
                <ul className="space-y-1 text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-x-4">
                  {Object.entries(weeklyMuscleGroupSummary)
                    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
                    .map(([group, count]) => (
                    <li key={group} className="flex justify-between">
                      <span className="font-medium text-foreground">{group}:</span> 
                      <span>{count} séries</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">Nenhuma série de exercícios concluídos registrada esta semana.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
