import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { DiceRoller } from "@/components/game/DiceRoller";
import { PropertyCard } from "@/components/game/PropertyCard";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home } from "lucide-react";

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

const Game = () => {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'rolling' | 'moving' | 'property'>('waiting');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [players] = useState<Player[]>([
    { id: 1, name: "Spieler 1", money: 1500, position: 0, color: "monopoly-red", properties: [] },
    { id: 2, name: "Spieler 2", money: 1500, position: 0, color: "monopoly-blue", properties: [] },
    { id: 3, name: "Spieler 3", money: 1500, position: 0, color: "monopoly-green", properties: [] },
    { id: 4, name: "Spieler 4", money: 1500, position: 0, color: "monopoly-yellow", properties: [] }
  ]);

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    return icons[value - 1];
  };

  const handleDiceRoll = (dice1: number, dice2: number) => {
    setGamePhase('moving');
    // Game logic will be implemented here
    setTimeout(() => {
      setGamePhase('waiting');
      setCurrentPlayer((prev) => (prev + 1) % players.length);
    }, 2000);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setGamePhase('property');
  };

  return (
    <div className="min-h-screen bg-gradient-board p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Zurück zum Hauptmenü
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Monopoly Online</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Runde 1
            </Badge>
            <Badge variant={gamePhase === 'waiting' ? 'default' : 'outline'} className="text-lg px-4 py-2">
              {players[currentPlayer].name} ist dran
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Board - Takes most space */}
          <div className="xl:col-span-3">
            <Card className="bg-board-bg border-board-border border-2 shadow-property">
              <CardContent className="p-6">
                <GameBoard
                  players={players}
                  currentPlayer={currentPlayer}
                  onPropertyClick={handlePropertyClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with game controls */}
          <div className="space-y-6">
            {/* Current Player Panel */}
            <PlayerPanel
              player={players[currentPlayer]}
              isCurrentPlayer={true}
              gamePhase={gamePhase}
            />

            {/* Dice Roller */}
            <DiceRoller
              onRoll={handleDiceRoll}
              disabled={gamePhase !== 'waiting'}
              isRolling={gamePhase === 'rolling'}
            />

            {/* Other Players */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Andere Spieler</h3>
              {players
                .filter((_, index) => index !== currentPlayer)
                .map((player, index) => (
                  <PlayerPanel
                    key={player.id}
                    player={player}
                    isCurrentPlayer={false}
                    gamePhase={gamePhase}
                  />
                ))}
            </div>

            {/* Game Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spielaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" disabled>
                  Handeln
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Häuser bauen
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Hypothek aufnehmen
                </Button>
                <Button variant="destructive" className="w-full" disabled>
                  Aufgeben
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property Modal */}
        {selectedProperty && (
          <PropertyCard
            property={selectedProperty}
            onClose={() => {
              setSelectedProperty(null);
              setGamePhase('waiting');
            }}
            onBuy={() => {
              // Buy logic here
              setSelectedProperty(null);
              setGamePhase('waiting');
            }}
            canBuy={!selectedProperty.owner && players[currentPlayer].money >= selectedProperty.price}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
