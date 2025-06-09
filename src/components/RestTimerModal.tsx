
"use client";

import { useState, useEffect, useCallback, useId } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, Pause, RotateCcw, AlarmClockCheck, Info } from 'lucide-react';
import type { WorkoutSession, SessionExercisePerformance } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession;
  exercisePerformance: SessionExercisePerformance;
  workoutId: string; // Needed for fetching average rest time contextually if desired
  defaultAlarmTimeSeconds: number;
  onSaveRestTime: (exerciseId: string, restSeconds: number) => void;
}

export function RestTimerModal({
  isOpen,
  onClose,
  session,
  exercisePerformance,
  workoutId,
  defaultAlarmTimeSeconds,
  onSaveRestTime,
}: RestTimerModalProps) {
  const { getAverageRestTimeForExercise } = useAppContext();
  const descriptionId = useId();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [alarmTimeInput, setAlarmTimeInput] = useState<string>(String(defaultAlarmTimeSeconds));
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [showAlarmNotification, setShowAlarmNotification] = useState(false);
  const [averageRest, setAverageRest] = useState<string | null>(null);

  useEffect(() => {
    // Reset timer when modal opens or exercise changes
    if (isOpen) {
      setElapsedSeconds(0);
      setIsActive(false);
      setIsAlarmSet(false);
      setShowAlarmNotification(false);
      setAlarmTimeInput(String(defaultAlarmTimeSeconds));

      const avg = getAverageRestTimeForExercise(exercisePerformance.exerciseId, 30);
      if (avg !== null) {
        setAverageRest(formatSecondsToMMSS(avg));
      } else {
        setAverageRest("Nenhum registro");
      }
    }
  }, [isOpen, exercisePerformance.exerciseId, defaultAlarmTimeSeconds, getAverageRestTimeForExercise]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && elapsedSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, elapsedSeconds]);

  useEffect(() => {
    if (isAlarmSet && isActive && elapsedSeconds > 0 && elapsedSeconds === parseInt(alarmTimeInput)) {
      setShowAlarmNotification(true);
      // Consider adding a sound or vibration here in the future
    }
  }, [elapsedSeconds, isActive, isAlarmSet, alarmTimeInput]);

  const handleStartPause = () => {
    setIsActive(!isActive);
    if (showAlarmNotification) setShowAlarmNotification(false); // Hide alarm if timer restarted/paused
  };

  const handleReset = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    setShowAlarmNotification(false);
  };

  const handleSetAlarm = () => {
    const time = parseInt(alarmTimeInput);
    if (!isNaN(time) && time > 0) {
      setIsAlarmSet(true);
      setShowAlarmNotification(false); // Reset notification if alarm is reset
    } else {
      setIsAlarmSet(false);
    }
  };

  const handleConcludeRest = () => {
    onSaveRestTime(exercisePerformance.exerciseId, elapsedSeconds);
    onClose();
  };

  const formatSecondsToMMSS = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Timer className="mr-2 h-5 w-5" /> Registrar Descanso: {exercisePerformance.exerciseName}
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            Monitore seu tempo de descanso. Você pode definir um alarme opcional.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="text-center">
            <p className="text-6xl font-mono font-bold text-primary">
              {formatSecondsToMMSS(elapsedSeconds)}
            </p>
            {showAlarmNotification && (
              <p className="text-orange-500 font-semibold mt-2 animate-pulse">Alarme de descanso atingido!</p>
            )}
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={handleStartPause} variant={isActive ? "destructive" : "default"} size="lg">
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isActive ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" disabled={elapsedSeconds === 0 && !isActive}>
              <RotateCcw className="mr-2 h-5 w-5" />
              Resetar
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label htmlFor="alarmTime" className="font-medium">Definir Alarme (segundos)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="alarmTime"
                type="number"
                value={alarmTimeInput}
                onChange={(e) => {
                    setAlarmTimeInput(e.target.value);
                    setIsAlarmSet(false); // User is changing, so un-set alarm until they confirm
                    setShowAlarmNotification(false);
                }}
                placeholder={`Padrão: ${defaultAlarmTimeSeconds}s`}
                className="w-full"
              />
              <Button onClick={handleSetAlarm} variant="secondary" disabled={isAlarmSet && parseInt(alarmTimeInput) === elapsedSeconds}>
                {isAlarmSet ? "Alarme Ativo" : "Ativar Alarme"}
              </Button>
            </div>
            {isAlarmSet && <p className="text-xs text-muted-foreground">Alarme definido para {alarmTimeInput} segundos.</p>}
          </div>
           <div className="pt-4 border-t">
             <p className="text-sm font-medium text-muted-foreground flex items-center">
                <Info className="mr-2 h-4 w-4 text-blue-500" />
                Descanso médio (últimos 30 dias): <span className="font-semibold text-foreground ml-1">{averageRest}</span>
             </p>
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConcludeRest}>
            <AlarmClockCheck className="mr-2 h-5 w-5" /> Concluir e Salvar Descanso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
