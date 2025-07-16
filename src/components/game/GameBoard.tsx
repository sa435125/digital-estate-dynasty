import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HomeIcon, Building, Landmark, Zap, Car, Trophy, Sparkles, Castle, Flame, Crown } from "lucide-react";
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
  currentPlayer: number;
  onPropertyClick: (property: Property) => void;
  properties: Property[];
}


export function GameBoard({ players, currentPlayer, onPropertyClick, properties }: GameBoardProps) {
  const getPropertyIcon = (property: Property) => {
    switch (property.type) {
      case 'railroad':
        return <Car className="h-3 w-3 text-slate-200" />;
      case 'utility':
        return <Zap className="h-3 w-3 text-blue-300" />;
      case 'special':
        if (property.id === 'start') return <HomeIcon className="h-3 w-3 text-yellow-300" />;
        if (property.id === 'prison' || property.id === 'banish') return <Building className="h-3 w-3 text-red-300" />;
        if (property.id.includes('fortune') || property.id.includes('destiny')) return <Sparkles className="h-3 w-3 text-purple-300" />;
        if (property.id === 'sanctuary') return <Castle className="h-3 w-3 text-green-300" />;
        return <Trophy className="h-3 w-3 text-orange-300" />;
      default:
        if (property.color.includes('legendary')) return <Crown className="h-3 w-3 text-indigo-300" />;
        if (property.color.includes('orange')) return <Flame className="h-3 w-3 text-orange-300" />;
        return <Landmark className="h-3 w-3 text-slate-300" />;
    }
  };

  const getPropertyBackgroundColor = (property: Property) => {
    if (property.color === 'special') return 'bg-slate-600';
    if (property.color.includes('gray')) return 'bg-gray-600';
    if (property.color.includes('blue-600')) return 'bg-blue-600';
    return property.color || 'bg-slate-500';
  };

  const getPlayersAtPosition = (position: number) => {
    return players.filter(player => player.position === position);
  };

  const renderProperty = (property: Property, index: number) => {
    const playersHere = getPlayersAtPosition(index);
    const isCorner = index === 0 || index === 10 || index === 20 || index === 30;
    const actualProperty = properties[index]; // Use the actual property data from props
    
    return (
      <div
        key={property.id}
        className={cn(
          "relative border-2 border-slate-600 bg-slate-700/80 backdrop-blur cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
          isCorner ? "w-20 h-20" : "w-16 h-20",
          "flex flex-col justify-between p-1 rounded-lg"
        )}
        onClick={() => property.type === 'property' && onPropertyClick(actualProperty)}
      >
        {/* Property color bar */}
        {property.type === 'property' && (
          <div className={cn("h-3 w-full rounded-sm border border-white/20", getPropertyBackgroundColor(property))} />
        )}
        
        {/* Property icon and name */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {getPropertyIcon(property)}
          <span className="text-xs font-medium text-white leading-tight mt-1">
            {property.name}
          </span>
          {property.price > 0 && (
            <span className="text-xs text-slate-300">
              {property.price}€
            </span>
          )}
        </div>

        {/* Players on this position */}
        {playersHere.length > 0 && (
          <div className="absolute -top-2 -right-2 flex flex-wrap gap-1">
            {playersHere.map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-white shadow-lg",
                    player.color,
                    player.id === players[currentPlayer].id && "ring-2 ring-yellow-400 ring-offset-1"
                  )}
                />
            ))}
          </div>
        )}

        {/* Owner indicator */}
        {actualProperty.owner && (
          <Badge 
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs h-4 px-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
          >
            {players.find(p => p.id === actualProperty.owner)?.name.charAt(0)}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-square">
      {/* Board container */}
      <div className="absolute inset-0 border-4 border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl">
        
        {/* Center area */}
        <div className="absolute inset-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-inner flex items-center justify-center border border-slate-600">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              MYSTISCHES
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              REICH
            </div>
            <div className="text-lg text-slate-300 mt-2">Fantasy Edition</div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-400">Magisches Abenteuer</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Bottom row (0-10) */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {BOARD_PROPERTIES.slice(0, 11).map((property, index) => renderProperty(property, index))}
        </div>

        {/* Right column (11-20) */}
        <div className="absolute right-0 top-0 bottom-20 flex flex-col-reverse">
          {BOARD_PROPERTIES.slice(11, 20).map((property, index) => renderProperty(property, index + 11))}
        </div>

        {/* Top row (21-30) */}
        <div className="absolute top-0 left-0 right-0 flex flex-row-reverse">
          {BOARD_PROPERTIES.slice(21, 31).map((property, index) => renderProperty(property, index + 21))}
        </div>

        {/* Left column (31-39) */}
        <div className="absolute left-0 top-20 bottom-0 flex flex-col">
          {BOARD_PROPERTIES.slice(31, 40).map((property, index) => renderProperty(property, index + 31))}
        </div>
      </div>
    </div>
  );
}