"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, History, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const PlaceholderChart = () => (
  <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
    <BarChart3 className="h-16 w-16 text-muted-foreground" />
    <p className="ml-2 text-muted-foreground">Gráfico em Breve</p>
  </div>
);

export default function ProgressTrackingPage() {
  const { sessions, completeSession } = useAppContext();
  const { toast } = useToast();

  const sortedSessions = [...sessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCompleteSession = (sessionId: string, workoutName: string) => {
    completeSession(sessionId);
    toast({
      title: "Treino Finalizado!",
      description: `A sessão de ${workoutName} foi marcada como concluída.`,
    });
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
              <CardDescription>Revise suas sessões de treino. Marque as sessões em andamento como finalizadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma sessão de treino registrada ainda. Inicie um treino da sua biblioteca!</p>
              ) : (
                <ScrollArea className="h-72">
                  <ul className="space-y-3">
                    {sortedSessions.map(session => (
                      <li key={session.id} className="p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{session.workoutName}</p>
                            <p className="text-sm text-muted-foreground">
                              Iniciado em: {format(new Date(session.date), 'PPP p', { locale: ptBR })}
                            </p>
                            {session.notes && <p className="text-xs italic mt-1 text-muted-foreground">{session.notes}</p>}
                          </div>
                          {!session.isCompleted ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCompleteSession(session.id, session.workoutName)}
                              className="whitespace-nowrap"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Finalizar
                            </Button>
                          ) : (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Concluído
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
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
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Fique ligado para mais funcionalidades avançadas de acompanhamento de progresso!</p>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
