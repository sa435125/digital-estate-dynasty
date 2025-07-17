import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

interface DiceRollerProps {
  onRoll: (dice1: number, dice2: number) => void;
  disabled: boolean;
  isRolling: boolean;
}

export function DiceRoller({ onRoll, disabled, isRolling }: DiceRollerProps) {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [lastRoll, setLastRoll] = useState<{ dice1: number; dice2: number; total: number } | null>(null);

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const IconComponent = icons[value - 1];
    return <IconComponent className="h-8 w-8" />;
  };

  const rollDice = () => {
    if (disabled || isRolling) return;

    const newDice1 = Math.floor(Math.random() * 6) + 1;
    const newDice2 = Math.floor(Math.random() * 6) + 1;
    
    // Animate the rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        setDice1(newDice1);
        setDice2(newDice2);
        setLastRoll({ dice1: newDice1, dice2: newDice2, total: newDice1 + newDice2 });
        onRoll(newDice1, newDice2);
      }
    }, 100);
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg text-center text-white">Würfel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Dice Display - responsive sizing */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-primary rounded-lg shadow-lg transition-transform duration-150",
            isRolling && "animate-dice-move"
          )}>
            <div className="scale-75 sm:scale-100 text-primary">
              {getDiceIcon(dice1)}
            </div>
          </div>
          <div className={cn(
            "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-primary rounded-lg shadow-lg transition-transform duration-150",
            isRolling && "animate-dice-move"
          )}>
            <div className="scale-75 sm:scale-100 text-primary">
              {getDiceIcon(dice2)}
            </div>
          </div>
        </div>

        {/* Last Roll Result - more compact on mobile */}
        {lastRoll && !isRolling && (
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg animate-slide-up">
            <div className="text-xs sm:text-sm text-muted-foreground">Letzter Wurf:</div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {lastRoll.dice1} + {lastRoll.dice2} = {lastRoll.total}
            </div>
            {lastRoll.dice1 === lastRoll.dice2 && (
              <div className="text-xs sm:text-sm text-accent font-medium mt-1">
                Pasch! Noch ein Wurf!
              </div>
            )}
          </div>
        )}

        {/* Roll Button - mobile optimized */}
        <Button
          onClick={rollDice}
          disabled={disabled || isRolling}
          className="w-full text-base sm:text-lg py-4 sm:py-6"
          size="lg"
        >
          {isRolling ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🎲</span>
              <span className="hidden sm:inline">Würfelt...</span>
              <span className="sm:hidden">Würfelt</span>
            </span>
          ) : (
            "Würfeln"
          )}
        </Button>

        {/* Instructions - responsive text */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          {disabled ? (
            isRolling ? (
              <>
                <span className="hidden sm:inline">Würfel werden geworfen...</span>
                <span className="sm:hidden">Würfelt...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Warte auf deinen Zug</span>
                <span className="sm:hidden">Warten...</span>
              </>
            )
          ) : (
            <>
              <span className="hidden sm:inline">Klicke um zu würfeln!</span>
              <span className="sm:hidden">Tippen zum Würfeln!</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}