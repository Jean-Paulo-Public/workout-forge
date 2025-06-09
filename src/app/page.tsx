
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react'; // Changed back from Weight
import { useState, useEffect } from 'react';

export default function WelcomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-16 w-16 text-primary" /> {/* Changed back from Weight */}
          </div>
          <CardTitle className="text-3xl font-headline">Bem-vindo ao Workout Forge!</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
            Sua jornada para uma vida mais saudável começa aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground">
            Crie, acompanhe e otimize seus treinos com facilidade.
            Clique em "Começar" para acessar seu painel.
          </p>
          <Link href="/dashboard" className="w-full">
            <Button size="lg" className="w-full text-lg">
              Começar
            </Button>
          </Link>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        {currentYear && <p>&copy; {currentYear} Workout Forge. Todos os direitos reservados.</p>}
        {!currentYear && <p>&nbsp;</p>}
      </footer>
    </div>
  );
}
