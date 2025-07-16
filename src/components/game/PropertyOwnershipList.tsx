import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Wrench } from "lucide-react";
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
    const owned = properties.filter(p => p.owner === parseInt(playerId));
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5" />
          Immobilienbesitz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map(player => {
          const ownedProperties = getOwnedProperties(player.id);
          const colorGroups = getColorGroups(player.id);
          
          return (
            <div key={player.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-medium">{player.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {ownedProperties.length} Immobilien
                </Badge>
              </div>
              
              {ownedProperties.length > 0 && (
                <div className="ml-6 space-y-1">
                  {/* Color Groups */}
                  {Object.entries(colorGroups).map(([color, props]) => (
                    <div key={color} className="flex flex-wrap items-center gap-2 text-sm">
                      <div 
                        className={cn("w-3 h-3 rounded border", color)}
                      />
                      <span className={hasMonopoly(player.id, color) ? "font-bold text-green-600" : ""}>
                        {props.map(p => `${p.name}${p.houses ? ` (${p.houses}🏠)` : ''}`).join(", ")}
                      </span>
                      {hasMonopoly(player.id, color) && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          <Home className="h-3 w-3 mr-1" />
                          Monopol
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {/* Railroads & Utilities */}
                  {ownedProperties.filter(p => p.type !== 'property').map(prop => (
                    <div key={prop.id} className="flex items-center gap-2 text-sm ml-3">
                      <Wrench className="h-3 w-3" />
                      <span>{prop.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {prop.type === 'railroad' ? 'Bahnhof' : 'Werk'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {ownedProperties.length === 0 && (
                <div className="ml-6 text-sm text-muted-foreground">
                  Keine Immobilien
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}