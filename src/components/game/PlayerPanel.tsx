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
      "transition-all duration-300 bg-slate-800/90 backdrop-blur-xl border-slate-700",
      isCurrentPlayer && "ring-2 ring-yellow-400 ring-offset-2 shadow-xl",
      isCurrentPlayer && gamePhase === 'moving' && "animate-pulse"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-white">
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
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white shadow-lg">
          <Coins className="h-5 w-5" />
          <span className="text-lg font-bold">
            {player.money.toLocaleString('de-DE')} Gold
          </span>
        </div>

        {/* Properties Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Besitztümer:</span>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {player.properties.length}
          </Badge>
        </div>

        {/* Position */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Position:</span>
          <Badge className="bg-slate-700 text-slate-300">
            Feld {player.position}
          </Badge>
        </div>

        {/* Player Status */}
        <div className="pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Status:</span>
            <span className={cn(
              "font-medium",
              isCurrentPlayer ? "text-yellow-400" : "text-slate-400",
              player.inJail && "text-red-400"
            )}>
              {player.inJail ? `Verlies (${player.jailTurns}/3)` : 
               isCurrentPlayer ? "Am Zug" : "Wartet"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}