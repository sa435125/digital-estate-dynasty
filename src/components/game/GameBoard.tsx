import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HomeIcon, Building, Landmark, Zap, Car, Trophy } from "lucide-react";

interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  properties: string[];
}

interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  color: string;
  owner?: number;
  type: 'property' | 'railroad' | 'utility' | 'special';
}

interface GameBoardProps {
  players: Player[];
  currentPlayer: number;
  onPropertyClick: (property: Property) => void;
  properties: Property[];
}

// Simplified board properties for demo
const BOARD_PROPERTIES: Property[] = [
  { id: "start", name: "Los", price: 0, rent: 0, color: "special", type: "special" },
  { id: "brown1", name: "Badstraße", price: 60, rent: 2, color: "monopoly-brown", type: "property" },
  { id: "chest1", name: "Gemeinschaftsfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "brown2", name: "Turmstraße", price: 60, rent: 4, color: "monopoly-brown", type: "property" },
  { id: "tax1", name: "Einkommensteuer", price: 0, rent: -200, color: "special", type: "special" },
  { id: "rail1", name: "Südbahnhof", price: 200, rent: 25, color: "railroad", type: "railroad" },
  { id: "blue1", name: "Chausseestraße", price: 100, rent: 6, color: "monopoly-blue", type: "property" },
  { id: "chance1", name: "Ereignisfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "blue2", name: "Elisenstraße", price: 100, rent: 6, color: "monopoly-blue", type: "property" },
  { id: "blue3", name: "Poststraße", price: 120, rent: 8, color: "monopoly-blue", type: "property" },
  
  { id: "jail", name: "Gefängnis", price: 0, rent: 0, color: "special", type: "special" },
  { id: "pink1", name: "Seestraße", price: 140, rent: 10, color: "monopoly-pink", type: "property" },
  { id: "utility1", name: "Elektrizitätswerk", price: 150, rent: 0, color: "utility", type: "utility" },
  { id: "pink2", name: "Hafenstraße", price: 140, rent: 10, color: "monopoly-pink", type: "property" },
  { id: "pink3", name: "Neue Straße", price: 160, rent: 12, color: "monopoly-pink", type: "property" },
  { id: "rail2", name: "Westbahnhof", price: 200, rent: 25, color: "railroad", type: "railroad" },
  { id: "orange1", name: "Münchener Straße", price: 180, rent: 14, color: "monopoly-orange", type: "property" },
  { id: "chest2", name: "Gemeinschaftsfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "orange2", name: "Wiener Straße", price: 180, rent: 14, color: "monopoly-orange", type: "property" },
  { id: "orange3", name: "Berliner Straße", price: 200, rent: 16, color: "monopoly-orange", type: "property" },
  
  { id: "parking", name: "Frei Parken", price: 0, rent: 0, color: "special", type: "special" },
  { id: "red1", name: "Theaterstraße", price: 220, rent: 18, color: "monopoly-red", type: "property" },
  { id: "chance2", name: "Ereignisfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "red2", name: "Museumstraße", price: 220, rent: 18, color: "monopoly-red", type: "property" },
  { id: "red3", name: "Opernplatz", price: 240, rent: 20, color: "monopoly-red", type: "property" },
  { id: "rail3", name: "Nordbahnhof", price: 200, rent: 25, color: "railroad", type: "railroad" },
  { id: "yellow1", name: "Lessingstraße", price: 260, rent: 22, color: "monopoly-yellow", type: "property" },
  { id: "yellow2", name: "Schillerstraße", price: 260, rent: 22, color: "monopoly-yellow", type: "property" },
  { id: "utility2", name: "Wasserwerk", price: 150, rent: 0, color: "utility", type: "utility" },
  { id: "yellow3", name: "Goethestraße", price: 280, rent: 24, color: "monopoly-yellow", type: "property" },
  
  { id: "go-to-jail", name: "Gehe ins Gefängnis", price: 0, rent: 0, color: "special", type: "special" },
  { id: "green1", name: "Rathausplatz", price: 300, rent: 26, color: "monopoly-green", type: "property" },
  { id: "green2", name: "Hauptstraße", price: 300, rent: 26, color: "monopoly-green", type: "property" },
  { id: "chest3", name: "Gemeinschaftsfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "green3", name: "Bahnhofstraße", price: 320, rent: 28, color: "monopoly-green", type: "property" },
  { id: "rail4", name: "Hauptbahnhof", price: 200, rent: 25, color: "railroad", type: "railroad" },
  { id: "chance3", name: "Ereignisfeld", price: 0, rent: 0, color: "special", type: "special" },
  { id: "purple1", name: "Parkstraße", price: 350, rent: 35, color: "monopoly-purple", type: "property" },
  { id: "tax2", name: "Zusatzsteuer", price: 0, rent: -100, color: "special", type: "special" },
  { id: "purple2", name: "Schlossallee", price: 400, rent: 50, color: "monopoly-purple", type: "property" },
];

export function GameBoard({ players, currentPlayer, onPropertyClick, properties }: GameBoardProps) {
  const getPropertyIcon = (property: Property) => {
    switch (property.type) {
      case 'railroad':
        return <Car className="h-3 w-3" />;
      case 'utility':
        return <Zap className="h-3 w-3" />;
      case 'special':
        if (property.id === 'start') return <HomeIcon className="h-3 w-3" />;
        if (property.id === 'jail' || property.id === 'go-to-jail') return <Building className="h-3 w-3" />;
        return <Trophy className="h-3 w-3" />;
      default:
        return <Landmark className="h-3 w-3" />;
    }
  };

  const getPropertyBackgroundColor = (property: Property) => {
    if (property.color === 'special') return 'bg-muted';
    if (property.color === 'railroad') return 'bg-gray-700';
    if (property.color === 'utility') return 'bg-amber-500';
    return `bg-${property.color}`;
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
          "relative border-2 border-board-border bg-card cursor-pointer transition-all duration-300 hover:shadow-property",
          isCorner ? "w-20 h-20" : "w-16 h-20",
          "flex flex-col justify-between p-1"
        )}
        onClick={() => property.type === 'property' && onPropertyClick(actualProperty)}
      >
        {/* Property color bar */}
        {property.type === 'property' && (
          <div className={cn("h-3 w-full rounded-sm", getPropertyBackgroundColor(property))} />
        )}
        
        {/* Property icon and name */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {getPropertyIcon(property)}
          <span className="text-xs font-medium text-foreground leading-tight mt-1">
            {property.name}
          </span>
          {property.price > 0 && (
            <span className="text-xs text-muted-foreground">
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
                  "w-4 h-4 rounded-full border-2 border-white shadow-sm",
                  `bg-${player.color}`,
                  player.id === players[currentPlayer].id && "ring-2 ring-primary ring-offset-1"
                )}
              />
            ))}
          </div>
        )}

        {/* Owner indicator */}
        {actualProperty.owner && (
          <Badge 
            variant="secondary" 
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs h-4 px-1"
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
      <div className="absolute inset-0 border-4 border-board-border bg-gradient-board rounded-lg">
        
        {/* Center area */}
        <div className="absolute inset-8 bg-card rounded-lg shadow-inner flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">MONOPOLY</div>
            <div className="text-lg text-muted-foreground">Online Edition</div>
            <div className="mt-4 text-sm text-muted-foreground">
              Aktuelle Runde: 1
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