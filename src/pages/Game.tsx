import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { DiceRoller } from "@/components/game/DiceRoller";
import { PropertyCard } from "@/components/game/PropertyCard";
import { useToast } from "@/hooks/use-toast";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home } from "lucide-react";

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

interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  color: string;
  owner?: number;
  type: 'property' | 'railroad' | 'utility' | 'special';
  houses?: number;
  mortgage?: boolean;
}

// Monopoly Board Properties
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

const Game = () => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'rolling' | 'moving' | 'property' | 'rent' | 'finished'>('waiting');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [round, setRound] = useState(1);
  const [lastDiceRoll, setLastDiceRoll] = useState<{dice1: number, dice2: number} | null>(null);

  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Spieler 1", money: 1500, position: 0, color: "monopoly-red", properties: [], inJail: false, jailTurns: 0 },
    { id: 2, name: "Spieler 2", money: 1500, position: 0, color: "monopoly-blue", properties: [], inJail: false, jailTurns: 0 },
    { id: 3, name: "Spieler 3", money: 1500, position: 0, color: "monopoly-green", properties: [], inJail: false, jailTurns: 0 },
    { id: 4, name: "Spieler 4", money: 1500, position: 0, color: "monopoly-yellow", properties: [], inJail: false, jailTurns: 0 }
  ]);

  const [properties, setProperties] = useState<Property[]>(BOARD_PROPERTIES);

  // Check for game over
  useEffect(() => {
    const activePlayers = players.filter(p => p.money > 0);
    if (activePlayers.length === 1 && gamePhase !== 'finished') {
      setGamePhase('finished');
      toast({
        title: "🎉 Spiel beendet!",
        description: `${activePlayers[0].name} hat gewonnen!`,
      });
    }
  }, [players, gamePhase, toast]);

  const movePlayer = (playerIndex: number, diceSum: number) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = newPlayers[playerIndex];
      
      const oldPosition = player.position;
      let newPosition = (oldPosition + diceSum) % 40;
      
      // Check if player passed "Los" (Start)
      if (newPosition < oldPosition) {
        player.money += 200;
        toast({
          title: "🏠 Über Los gegangen!",
          description: `${player.name} erhält 200€`,
        });
      }
      
      player.position = newPosition;
      return newPlayers;
    });
  };

  const handlePropertyLanding = (playerIndex: number, property: Property) => {
    const player = players[playerIndex];
    const propertyData = properties.find(p => p.id === property.id);
    
    if (!propertyData || propertyData.type === 'special') {
      handleSpecialField(playerIndex, propertyData);
      return;
    }

    if (propertyData.owner && propertyData.owner !== player.id) {
      // Pay rent
      const rent = calculateRent(propertyData);
      const owner = players.find(p => p.id === propertyData.owner);
      
      if (rent > 0 && owner) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const payerIndex = newPlayers.findIndex(p => p.id === player.id);
          const ownerIndex = newPlayers.findIndex(p => p.id === owner.id);
          
          const actualPayment = Math.min(newPlayers[payerIndex].money, rent);
          newPlayers[payerIndex].money -= actualPayment;
          newPlayers[ownerIndex].money += actualPayment;
          
          return newPlayers;
        });
        
        toast({
          title: "💰 Miete gezahlt",
          description: `${player.name} zahlt ${rent}€ Miete an ${owner.name}`,
        });
      }
      nextTurn();
    } else if (!propertyData.owner && propertyData.price > 0) {
      // Property can be bought
      setSelectedProperty(propertyData);
      setGamePhase('property');
    } else {
      nextTurn();
    }
  };

  const handleSpecialField = (playerIndex: number, property: Property | undefined) => {
    const player = players[playerIndex];
    
    if (!property) {
      nextTurn();
      return;
    }

    switch (property.id) {
      case 'tax1':
        // Income tax
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].money -= 200;
          return newPlayers;
        });
        toast({
          title: "💸 Einkommensteuer",
          description: `${player.name} zahlt 200€ Steuern`,
        });
        break;
        
      case 'tax2':
        // Additional tax
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].money -= 100;
          return newPlayers;
        });
        toast({
          title: "💸 Zusatzsteuer",
          description: `${player.name} zahlt 100€ Steuern`,
        });
        break;
        
      case 'go-to-jail':
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].position = 10; // Jail position
          newPlayers[playerIndex].inJail = true;
          newPlayers[playerIndex].jailTurns = 0;
          return newPlayers;
        });
        toast({
          title: "🔒 Ab ins Gefängnis!",
          description: `${player.name} wurde ins Gefängnis geschickt`,
        });
        break;
        
      case 'parking':
        toast({
          title: "🚗 Frei Parken",
          description: `${player.name} kann sich ausruhen`,
        });
        break;
        
      default:
        toast({
          title: "❓ Ereignis",
          description: `${player.name} landet auf ${property.name}`,
        });
    }
    
    nextTurn();
  };

  const calculateRent = (property: Property): number => {
    if (property.type === 'railroad') {
      const ownedRailroads = properties.filter(p => 
        p.type === 'railroad' && p.owner === property.owner
      ).length;
      return 25 * Math.pow(2, ownedRailroads - 1);
    }
    
    if (property.type === 'utility') {
      const ownedUtilities = properties.filter(p => 
        p.type === 'utility' && p.owner === property.owner
      ).length;
      const multiplier = ownedUtilities === 1 ? 4 : 10;
      const diceSum = lastDiceRoll ? lastDiceRoll.dice1 + lastDiceRoll.dice2 : 7;
      return diceSum * multiplier;
    }
    
    // Regular property
    const houses = property.houses || 0;
    if (houses === 0) return property.rent;
    if (houses === 1) return property.rent * 5;
    if (houses === 2) return property.rent * 15;
    if (houses === 3) return property.rent * 45;
    if (houses === 4) return property.rent * 80;
    return property.rent * 110; // Hotel
  };

  const handleDiceRoll = (dice1: number, dice2: number) => {
    setLastDiceRoll({ dice1, dice2 });
    setGamePhase('moving');
    
    const diceSum = dice1 + dice2;
    const player = players[currentPlayer];
    
    if (player.inJail) {
      if (dice1 === dice2) {
        // Double - get out of jail
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[currentPlayer].inJail = false;
          newPlayers[currentPlayer].jailTurns = 0;
          return newPlayers;
        });
        toast({
          title: "🔓 Pasch! Aus dem Gefängnis!",
          description: `${player.name} ist frei und darf sich bewegen`,
        });
        movePlayer(currentPlayer, diceSum);
      } else {
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[currentPlayer].jailTurns++;
          return newPlayers;
        });
        toast({
          title: "🔒 Noch im Gefängnis",
          description: `${player.name} muss noch ${3 - (player.jailTurns + 1)} Runden warten`,
        });
        nextTurn();
        return;
      }
    } else {
      movePlayer(currentPlayer, diceSum);
    }
    
    setTimeout(() => {
      const newPosition = (player.position + diceSum) % 40;
      const landedProperty = properties[newPosition];
      handlePropertyLanding(currentPlayer, landedProperty);
    }, 1500);
  };

  const handlePropertyPurchase = (property: Property) => {
    const player = players[currentPlayer];
    
    if (player.money >= property.price) {
      setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[currentPlayer].money -= property.price;
        newPlayers[currentPlayer].properties.push(property.id);
        return newPlayers;
      });
      
      setProperties(prev => {
        const newProperties = [...prev];
        const propertyIndex = newProperties.findIndex(p => p.id === property.id);
        newProperties[propertyIndex].owner = player.id;
        return newProperties;
      });
      
      toast({
        title: "🏠 Immobilie gekauft!",
        description: `${player.name} hat ${property.name} für ${property.price}€ gekauft`,
      });
    }
    
    setSelectedProperty(null);
    setGamePhase('waiting');
    nextTurn();
  };

  const nextTurn = () => {
    setTimeout(() => {
      setCurrentPlayer(prev => {
        const nextPlayer = (prev + 1) % players.length;
        // Skip bankrupt players
        if (players[nextPlayer].money <= 0) {
          return (nextPlayer + 1) % players.length;
        }
        return nextPlayer;
      });
      
      if (currentPlayer === players.length - 1) {
        setRound(prev => prev + 1);
      }
      
      setGamePhase('waiting');
    }, 1000);
  };

  const handlePropertyClick = (property: Property) => {
    if (gamePhase === 'property' || property.owner) {
      setSelectedProperty(property);
    }
  };

  if (gamePhase === 'finished') {
    const winner = players.find(p => p.money > 0);
    return (
      <div className="min-h-screen bg-gradient-board flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-3xl">🎉 Spiel beendet!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xl">
              <strong>{winner?.name}</strong> hat gewonnen!
            </div>
            <div className="text-lg text-muted-foreground">
              Endvermögen: {winner?.money.toLocaleString('de-DE')}€
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Neues Spiel starten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-board p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4" />
              Zurück zum Hauptmenü
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Monopoly Online</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Runde {round}
            </Badge>
            <Badge variant={gamePhase === 'waiting' ? 'default' : 'outline'} className="text-lg px-4 py-2">
              {players[currentPlayer].name} ist dran
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="xl:col-span-3">
            <Card className="bg-board-bg border-board-border border-2 shadow-property">
              <CardContent className="p-6">
                <GameBoard
                  players={players}
                  currentPlayer={currentPlayer}
                  onPropertyClick={handlePropertyClick}
                  properties={properties}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlayerPanel
              player={players[currentPlayer]}
              isCurrentPlayer={true}
              gamePhase={gamePhase}
            />

            <DiceRoller
              onRoll={handleDiceRoll}
              disabled={gamePhase !== 'waiting'}
              isRolling={gamePhase === 'rolling' || gamePhase === 'moving'}
            />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Andere Spieler</h3>
              {players
                .filter((_, index) => index !== currentPlayer)
                .map((player) => (
                  <PlayerPanel
                    key={player.id}
                    player={player}
                    isCurrentPlayer={false}
                    gamePhase={gamePhase}
                  />
                ))}
            </div>

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
              if (gamePhase === 'property') {
                nextTurn();
              }
              setGamePhase('waiting');
            }}
            onBuy={() => handlePropertyPurchase(selectedProperty)}
            canBuy={!selectedProperty.owner && players[currentPlayer].money >= selectedProperty.price && gamePhase === 'property'}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
