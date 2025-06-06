"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarClock, LibraryBig, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { scheduledWorkouts, workouts, sessions } = useAppContext();

  const upcomingWorkout = scheduledWorkouts
    .filter(sw => new Date(sw.dateTime) >= new Date())
    .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

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
                    Biblioteca de Treinos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-2">Você tem {workouts.length} treino(s) salvo(s).</p>
                <Link href="/library">
                    <Button variant="outline" size="sm">Ir para Biblioteca</Button>
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
                <p className="text-muted-foreground mb-2">Você completou {sessions.length} sessão(ões).</p>
                 <Link href="/progress">
                    <Button variant="outline" size="sm">Ver Progresso</Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
