import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Coins, Home, Crown } from "lucide-react";

interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  properties: string[];
  inJail: boolean;
  jailTurns: number;
}

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  gamePhase: 'waiting' | 'rolling' | 'moving' | 'property' | 'rent' | 'finished';
}

export function PlayerPanel({ player, isCurrentPlayer, gamePhase }: PlayerPanelProps) {
  return (
    <Card className={cn(
      "transition-all duration-300",
      isCurrentPlayer && "ring-2 ring-primary ring-offset-2 shadow-lg",
      isCurrentPlayer && gamePhase === 'moving' && "animate-pulse-slow"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <Avatar className={cn("border-2", `border-${player.color}`)}>
            <AvatarFallback className={cn("font-bold text-white", `bg-${player.color}`)}>
              {player.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{player.name}</span>
              {isCurrentPlayer && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            {isCurrentPlayer && (
              <Badge variant={gamePhase === 'waiting' ? 'default' : 'outline'} className="text-xs">
                {gamePhase === 'waiting' && 'Bereit zum Würfeln'}
                {gamePhase === 'rolling' && 'Würfelt...'}
                {gamePhase === 'moving' && 'Bewegt sich...'}
                {gamePhase === 'property' && 'Entscheidet...'}
                {gamePhase === 'rent' && 'Zahlt Miete...'}
                {player.inJail && 'Im Gefängnis'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Money */}
        <div className="flex items-center gap-2 p-3 bg-gradient-money rounded-lg text-white">
          <Coins className="h-5 w-5" />
          <span className="text-lg font-bold">
            {player.money.toLocaleString('de-DE')} €
          </span>
        </div>

        {/* Properties Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>Besitztümer:</span>
          </div>
          <Badge variant="outline">
            {player.properties.length}
          </Badge>
        </div>

        {/* Position */}
        <div className="flex items-center justify-between text-sm">
          <span>Position:</span>
          <Badge variant="secondary">
            Feld {player.position}
          </Badge>
        </div>

        {/* Player Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status:</span>
            <span className={cn(
              "font-medium",
              isCurrentPlayer ? "text-primary" : "text-muted-foreground",
              player.inJail && "text-destructive"
            )}>
              {player.inJail ? `Gefängnis (${player.jailTurns}/3)` : 
               isCurrentPlayer ? "Am Zug" : "Wartet"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}