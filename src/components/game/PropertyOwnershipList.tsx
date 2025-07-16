import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Car, Zap } from "lucide-react";
import { Property } from "@/data/properties";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  color: string;
  properties: string[];
}

interface PropertyOwnershipListProps {
  players: Player[];
  properties: Property[];
}

export function PropertyOwnershipList({ players, properties }: PropertyOwnershipListProps) {
  console.log('PropertyOwnershipList - players:', players);
  console.log('PropertyOwnershipList - properties:', properties);
  
  const getOwnedProperties = (playerId: string) => {
    const playerIdAsNumber = parseInt(playerId);
    const owned = properties.filter(p => 
      (typeof p.owner === 'number' && p.owner === playerIdAsNumber) ||
      (typeof p.owner === 'string' && p.owner === playerId)
    );
    console.log(`Player ${playerId} owns:`, owned);
    return owned;
  };

  const getColorGroups = (playerId: string) => {
    const ownedProps = getOwnedProperties(playerId);
    const colorGroups: Record<string, Property[]> = {};
    
    ownedProps.forEach(prop => {
      if (prop.type === 'property') {
        if (!colorGroups[prop.color]) {
          colorGroups[prop.color] = [];
        }
        colorGroups[prop.color].push(prop);
      }
    });
    
    return colorGroups;
  };

  const hasMonopoly = (playerId: string, color: string) => {
    const colorGroup = properties.filter(p => p.color === color && p.type === 'property');
    const ownedInGroup = getOwnedProperties(playerId).filter(p => p.color === color && p.type === 'property');
    return colorGroup.length === ownedInGroup.length;
  };

  return (
    <Card className="w-full bg-slate-800/90 backdrop-blur-sm border-slate-700 shadow-game">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Building className="h-5 w-5 text-yellow-400" />
          Immobilienbesitz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map(player => {
          const ownedProperties = getOwnedProperties(player.id);
          const colorGroups = getColorGroups(player.id);
          
          return (
            <div key={player.id} className="space-y-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center gap-3">
                <div 
                  className={cn("w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold text-white", player.color)}
                >
                  {player.name.charAt(0)}
                </div>
                <span className="font-bold text-white text-lg">{player.name}</span>
                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {ownedProperties.length} {ownedProperties.length === 1 ? 'Immobilie' : 'Immobilien'}
                </Badge>
              </div>
              
              {ownedProperties.length > 0 && (
                <div className="ml-9 space-y-2">
                  {/* Color Groups */}
                  {Object.entries(colorGroups).map(([color, props]) => (
                    <div key={color} className="p-2 bg-slate-600/50 rounded-md">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div 
                          className={cn("w-4 h-4 rounded border-2 border-white shadow", color)}
                        />
                        <span className={cn(
                          "font-medium",
                          hasMonopoly(player.id, color) ? "text-green-400 font-bold" : "text-white"
                        )}>
                          {props.map(p => `${p.name}${p.houses ? ` (${p.houses}🏠)` : ''}`).join(", ")}
                        </span>
                        {hasMonopoly(player.id, color) && (
                          <Badge variant="default" className="text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                            <Home className="h-3 w-3 mr-1" />
                            MONOPOL
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Railroads & Utilities */}
                  {ownedProperties.filter(p => p.type !== 'property').map(prop => (
                    <div key={prop.id} className="flex items-center gap-2 text-sm p-2 bg-slate-600/30 rounded">
                      {prop.type === 'railroad' ? <Car className="h-4 w-4 text-yellow-400" /> : <Zap className="h-4 w-4 text-blue-400" />}
                      <span className="text-white font-medium">{prop.name}</span>
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                        {prop.type === 'railroad' ? 'Bahnhof' : 'Werk'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {ownedProperties.length === 0 && (
                <div className="ml-9 text-sm text-slate-400 italic">
                  Keine Immobilien besessen
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}