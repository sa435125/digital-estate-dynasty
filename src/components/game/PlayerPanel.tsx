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
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-white">
          <Avatar className={cn("border-2 w-8 h-8 sm:w-10 sm:h-10", `border-${player.color}`)}>
            <AvatarFallback className={cn("font-bold text-white text-sm sm:text-base", `bg-${player.color}`)}>
              {player.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-lg font-medium truncate">{player.name}</span>
              {isCurrentPlayer && <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />}
            </div>
            {isCurrentPlayer && (
              <Badge variant={gamePhase === 'waiting' ? 'default' : 'outline'} className="text-xs">
                {gamePhase === 'waiting' && 'Bereit'}
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
      
      <CardContent className="space-y-2 sm:space-y-3">
        {/* Money - more compact on mobile */}
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white shadow-lg">
          <Coins className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-sm sm:text-lg font-bold">
            {player.money.toLocaleString('de-DE')} Gold
          </span>
        </div>

        {/* Properties and Position - Side by side on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:space-y-2 sm:block">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
              <span className="text-slate-300 hidden sm:inline">Besitztümer:</span>
              <span className="text-slate-300 sm:hidden">Besitz:</span>
            </div>
            <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
              {player.properties.length}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-300">Position:</span>
            <Badge className="bg-slate-700 text-slate-300 text-xs">
              {player.position}
            </Badge>
          </div>
        </div>

        {/* Player Status */}
        <div className="pt-1 sm:pt-2 border-t border-slate-600">
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