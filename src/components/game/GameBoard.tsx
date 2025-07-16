import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HomeIcon, Building, Landmark, Zap, Car, Trophy, Sparkles, Castle, Flame, Crown, Home } from "lucide-react";
import { BOARD_PROPERTIES, Property } from "@/data/properties";

interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  properties: string[];
}

interface GameBoardProps {
  players: Player[];
}

export function GameBoard({ players }: GameBoardProps) {
  const getPropertyIcon = (property: Property) => {
    switch (property.type) {
      case 'railroad':
        return <Car className="h-4 w-4 text-yellow-300" />;
      case 'utility':
        return <Zap className="h-4 w-4 text-blue-300" />;
      case 'special':
        if (property.id === 'start') return <HomeIcon className="h-4 w-4 text-yellow-400" />;
        if (property.id === 'prison' || property.id === 'banish') return <Building className="h-4 w-4 text-red-400" />;
        if (property.id.includes('fortune') || property.id.includes('destiny')) return <Sparkles className="h-4 w-4 text-purple-400" />;
        if (property.id === 'sanctuary') return <Castle className="h-4 w-4 text-green-400" />;
        return <Trophy className="h-4 w-4 text-orange-400" />;
      default:
        if (property.color.includes('legendary')) return <Crown className="h-4 w-4 text-indigo-400" />;
        if (property.color.includes('orange')) return <Flame className="h-4 w-4 text-orange-400" />;
        return <Landmark className="h-4 w-4 text-blue-300" />;
    }
  };

  const getPropertyBackgroundColor = (property: Property) => {
    if (property.color === 'special') return 'bg-slate-600/80';
    if (property.color.includes('gray')) return 'bg-gray-500/80';
    if (property.color.includes('blue-600')) return 'bg-blue-500/80';
    return property.color.replace('bg-', 'bg-') + '/80' || 'bg-slate-500/80';
  };

  const getPlayersAtPosition = (position: number) => {
    return players.filter(player => player.position === position);
  };

  const getPropertyOwner = (property: Property) => {
    if (!property.owner) return null;
    return players.find(p => p.id === property.owner);
  };

  const renderProperty = (property: Property, index: number) => {
    const playersHere = getPlayersAtPosition(index);
    const isCorner = index === 0 || index === 10 || index === 20 || index === 30;
    const owner = getPropertyOwner(property);
    
    return (
      <div
        key={property.id}
        className={cn(
          "relative border-2 border-white/20 bg-slate-800/90 backdrop-blur cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-yellow-400/50",
          // Responsive sizing with better visibility
          isCorner ? "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24" : "w-12 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-24",
          "flex flex-col justify-between p-1 sm:p-2 rounded-lg"
        )}
      >
        {/* Property color bar - larger and more visible */}
        {property.type === 'property' && (
          <div className={cn(
            "h-3 sm:h-4 w-full rounded-md border border-white/30 shadow-sm", 
            getPropertyBackgroundColor(property)
          )} />
        )}
        
        {/* Property icon and info */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-1">
            {getPropertyIcon(property)}
          </div>
          
          {/* Property name - always visible on larger screens */}
          <span className="text-xs font-bold text-white leading-tight hidden sm:block text-center">
            {property.name}
          </span>
          
          {/* Shortened name for mobile */}
          <span className="text-xs font-bold text-white leading-tight block sm:hidden text-center">
            {property.name.split(' ')[0]}
          </span>
          
          {/* Price - more prominent */}
          {property.price > 0 && (
            <span className="text-xs text-yellow-300 font-medium hidden sm:block">
              {property.price}€
            </span>
          )}

          {/* Houses indicator */}
          {property.houses && property.houses > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Home className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-bold">{property.houses}</span>
            </div>
          )}
        </div>

        {/* Players on this position - more prominent */}
        {playersHere.length > 0 && (
          <div className="absolute -top-2 -right-2 flex flex-wrap gap-1 max-w-16">
            {playersHere.slice(0, 4).map((player, playerIndex) => (
              <div
                key={player.id}
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white",
                  player.color,
                  "animate-bounce-in",
                  "hover:scale-110 transition-transform"
                )}
                style={{ animationDelay: `${playerIndex * 0.1}s` }}
                title={player.name}
              >
                {player.name.charAt(0)}
              </div>
            ))}
            {playersHere.length > 4 && (
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-600 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white">
                +{playersHere.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Owner indicator - much more prominent */}
        {owner && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Badge 
              className={cn(
                "text-xs h-5 px-2 text-white border-2 border-white font-bold shadow-lg",
                owner.color,
                "animate-pulse-glow"
              )}
            >
              {owner.name.charAt(0)}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-square">
      {/* Board container - enhanced design */}
      <div className="absolute inset-0 border-4 border-yellow-400/50 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl shadow-game backdrop-blur-sm">
        
        {/* Center area - more prominent */}
        <div className="absolute inset-6 sm:inset-12 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl shadow-inner flex items-center justify-center border-2 border-yellow-400/30 backdrop-blur-sm">
          <div className="text-center px-4">
            <div className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2 drop-shadow-lg">
              MYSTISCHES
            </div>
            <div className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-1">
              REICH
            </div>
            <div className="text-sm sm:text-lg text-yellow-400 mt-2 font-medium drop-shadow">Fantasy Monopoly</div>
            <div className="mt-3 sm:mt-6 flex items-center justify-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white/80 font-medium">Magisches Abenteuer</span>
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Board positions - enhanced layout */}
        
        {/* Bottom row (0-10) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {BOARD_PROPERTIES.slice(0, 11).map((property, index) => renderProperty(property, index))}
        </div>

        {/* Right column (11-20) */}
        <div className="absolute right-0 top-16 sm:top-24 bottom-16 sm:bottom-24 flex flex-col-reverse justify-between">
          {BOARD_PROPERTIES.slice(11, 20).map((property, index) => renderProperty(property, index + 11))}
        </div>

        {/* Top row (21-30) */}
        <div className="absolute top-0 left-0 right-0 flex flex-row-reverse justify-between">
          {BOARD_PROPERTIES.slice(21, 31).map((property, index) => renderProperty(property, index + 21))}
        </div>

        {/* Left column (31-39) */}
        <div className="absolute left-0 top-16 sm:top-24 bottom-16 sm:bottom-24 flex flex-col justify-between">
          {BOARD_PROPERTIES.slice(31, 40).map((property, index) => renderProperty(property, index + 31))}
        </div>
      </div>
    </div>
  );
}