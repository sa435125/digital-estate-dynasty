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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-center">Würfel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dice Display */}
        <div className="flex items-center justify-center gap-4">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 bg-dice-bg border-2 border-board-border rounded-lg shadow-dice transition-transform duration-150",
            isRolling && "animate-bounce-gentle"
          )}>
            {getDiceIcon(dice1)}
          </div>
          <div className={cn(
            "flex items-center justify-center w-16 h-16 bg-dice-bg border-2 border-board-border rounded-lg shadow-dice transition-transform duration-150",
            isRolling && "animate-bounce-gentle"
          )}>
            {getDiceIcon(dice2)}
          </div>
        </div>

        {/* Last Roll Result */}
        {lastRoll && !isRolling && (
          <div className="text-center p-3 bg-muted/50 rounded-lg animate-slide-up">
            <div className="text-sm text-muted-foreground">Letzter Wurf:</div>
            <div className="text-2xl font-bold text-primary">
              {lastRoll.dice1} + {lastRoll.dice2} = {lastRoll.total}
            </div>
            {lastRoll.dice1 === lastRoll.dice2 && (
              <div className="text-sm text-accent font-medium mt-1">
                Pasch! Noch ein Wurf!
              </div>
            )}
          </div>
        )}

        {/* Roll Button */}
        <Button
          onClick={rollDice}
          disabled={disabled || isRolling}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isRolling ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🎲</span>
              Würfelt...
            </span>
          ) : (
            "Würfeln"
          )}
        </Button>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          {disabled ? (
            isRolling ? "Würfel werden geworfen..." : "Warte auf deinen Zug"
          ) : (
            "Klicke um zu würfeln!"
          )}
        </div>
      </CardContent>
    </Card>
  );
}