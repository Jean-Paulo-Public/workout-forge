"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarClock, LibraryBig, TrendingUp, Settings, Save } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings } from '@/lib/types';
import { useEffect } from 'react'; // Importação adicionada

const userSettingsSchema = z.object({
  defaultSets: z.coerce.number().min(1, "Séries devem ser pelo menos 1."),
  defaultReps: z.string().min(1, "Repetições são obrigatórias."),
});

type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

export default function DashboardPage() {
  const { scheduledWorkouts, workouts, sessions, userSettings, updateUserSettings } = useAppContext();
  const { toast } = useToast();

  const upcomingWorkout = scheduledWorkouts
    .filter(sw => new Date(sw.dateTime) >= new Date())
    .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  const settingsForm = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      defaultSets: userSettings.defaultSets,
      defaultReps: userSettings.defaultReps,
    },
  });

  function onSettingsSubmit(values: UserSettingsFormData) {
    updateUserSettings(values);
    toast({
      title: "Configurações Salvas!",
      description: "Suas configurações padrão de treino foram atualizadas.",
    });
  }
  
  // Update form default values if userSettings change from context (e.g. initial load)
  useEffect(() => {
    settingsForm.reset({
      defaultSets: userSettings.defaultSets,
      defaultReps: userSettings.defaultReps,
    });
  }, [userSettings, settingsForm]);


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Painel</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Bem-vindo ao Workout Forge!</CardTitle>
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

          {upcomingWorkout && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        <CalendarClock className="text-primary" />
                        Próximo Treino
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{upcomingWorkout.workoutName}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(upcomingWorkout.dateTime), "PPPp", { locale: ptBR })}
                    </p>
                    <Link href="/scheduler" className="mt-2">
                        <Button variant="outline" size="sm">Ver Agenda</Button>
                    </Link>
                </CardContent>
            </Card>
          )}

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

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Settings className="text-primary" />
                Configurações Padrão
              </CardTitle>
              <CardDescription>Defina séries e repetições padrão para novos exercícios.</CardDescription>
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
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
