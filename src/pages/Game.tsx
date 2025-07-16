import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { DiceRoller } from "@/components/game/DiceRoller";
import { PropertyCard } from "@/components/game/PropertyCard";
import { MoneyTransfer } from "@/components/game/MoneyTransfer";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, Send, Crown } from "lucide-react";
import { BOARD_PROPERTIES, Property } from "@/data/properties";

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


const Game = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'rolling' | 'moving' | 'property' | 'rent' | 'finished'>('waiting');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [round, setRound] = useState(1);
  const [lastDiceRoll, setLastDiceRoll] = useState<{dice1: number, dice2: number} | null>(null);
  const [showMoneyTransfer, setShowMoneyTransfer] = useState(false);
  const [gameCode, setGameCode] = useState("");

  // Initialize players from lobby data or use defaults
  const [players, setPlayers] = useState<Player[]>(() => {
    const gameData = localStorage.getItem('monopoly-game-data');
    if (gameData) {
      const parsed = JSON.parse(gameData);
      setGameCode(parsed.gameCode || "");
      return parsed.players.map((player: any, index: number) => ({
        id: index + 1,
        name: player.name,
        money: 1500,
        position: 0,
        color: player.color,
        properties: [],
        inJail: false,
        jailTurns: 0
      }));
    }
    
    return [
      { id: 1, name: "Spieler 1", money: 1500, position: 0, color: "bg-red-500", properties: [], inJail: false, jailTurns: 0 },
      { id: 2, name: "Spieler 2", money: 1500, position: 0, color: "bg-blue-500", properties: [], inJail: false, jailTurns: 0 }
    ];
  });

  const [properties, setProperties] = useState<Property[]>(BOARD_PROPERTIES);

  // Check for game over
  useEffect(() => {
    const activePlayers = players.filter(p => p.money > 0);
    if (activePlayers.length === 1 && gamePhase !== 'finished') {
      setGamePhase('finished');
      toast({
        title: "👑 Spiel beendet!",
        description: `${activePlayers[0].name} regiert nun das Reich!`,
      });
    }
  }, [players, gamePhase, toast]);

  const movePlayer = (playerIndex: number, diceSum: number) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = newPlayers[playerIndex];
      
      const oldPosition = player.position;
      let newPosition = (oldPosition + diceSum) % 40;
      
      // Check if player passed "Nexus Plaza" (Start)
      if (newPosition < oldPosition) {
        player.money += 200;
        toast({
          title: "🌟 Durch Nexus Plaza!",
          description: `${player.name} erhält 200€ für die Reise`,
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
          title: "🏠 Tribut gezahlt",
          description: `${player.name} zahlt ${rent}€ an ${owner.name}`,
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
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].money -= 200;
          return newPlayers;
        });
        toast({
          title: "⚡ Gildensteuer",
          description: `${player.name} zahlt 200€ an die Händlergilde`,
        });
        break;
        
      case 'tax2':
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].money -= 100;
          return newPlayers;
        });
        toast({
          title: "🐉 Drachensteuer",
          description: `${player.name} zahlt 100€ Tribut an den Drachen`,
        });
        break;
        
      case 'banish':
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[playerIndex].position = 10; // Prison position
          newPlayers[playerIndex].inJail = true;
          newPlayers[playerIndex].jailTurns = 0;
          return newPlayers;
        });
        toast({
          title: "🏰 Ins Drachenverlies!",
          description: `${player.name} wurde verbannt`,
        });
        break;
        
      case 'sanctuary':
        toast({
          title: "🛡️ Sicherer Hafen",
          description: `${player.name} ruht sich im Refugium aus`,
        });
        break;
        
      default:
        if (property.id.includes('fortune') || property.id.includes('destiny')) {
          const bonuses = [0, 50, 100, 200, -50, -100];
          const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
          setPlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[playerIndex].money += bonus;
            return newPlayers;
          });
          toast({
            title: bonus >= 0 ? "🍀 Glück gehabt!" : "💸 Pech gehabt!",
            description: `${player.name} ${bonus >= 0 ? 'erhält' : 'verliert'} ${Math.abs(bonus)}€`,
          });
        } else {
          toast({
            title: "✨ Magischer Ort",
            description: `${player.name} besucht ${property.name}`,
          });
        }
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
          title: "🔓 Pasch! Befreit!",
          description: `${player.name} entkommt dem Drachenverlies`,
        });
        movePlayer(currentPlayer, diceSum);
      } else {
        setPlayers(prev => {
          const newPlayers = [...prev];
          newPlayers[currentPlayer].jailTurns++;
          return newPlayers;
        });
        toast({
          title: "🔒 Noch gefangen",
          description: `${player.name} muss noch ${3 - (player.jailTurns + 1)} Runden im Verlies bleiben`,
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
        title: "🏰 Besitztum erworben!",
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

  const handleMoneyTransfer = (fromPlayerId: number, toPlayerId: number, amount: number) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const fromIndex = newPlayers.findIndex(p => p.id === fromPlayerId);
      const toIndex = newPlayers.findIndex(p => p.id === toPlayerId);
      
      newPlayers[fromIndex].money -= amount;
      newPlayers[toIndex].money += amount;
      
      return newPlayers;
    });
  };

  if (gamePhase === 'finished') {
    const winner = players.find(p => p.money > 0);
    return (
      <div className="min-h-screen bg-gradient-board flex items-center justify-center">
        <Card className="max-w-md w-full text-center bg-slate-800/90 backdrop-blur-xl border-slate-700">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">👑 Reich erobert!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xl text-white">
              <strong>{winner?.name}</strong> herrscht nun über das Reich!
            </div>
            <div className="text-lg text-slate-300">
              Reichsschatz: {winner?.money.toLocaleString('de-DE')}€
            </div>
            <Button 
              onClick={() => navigate("/lobby")} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Neues Abenteuer starten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700" 
              onClick={() => navigate('/lobby')}
            >
              <Home className="h-4 w-4" />
              Lobby verlassen
            </Button>
            <h1 className="text-3xl font-bold text-white">Mystisches Reich</h1>
            {gameCode && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Code: {gameCode}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-slate-700 text-white">
              Runde {round}
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              {players[currentPlayer].name} ist dran
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="xl:col-span-3">
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700 border-2 shadow-2xl">
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

            {/* Money Transfer Button */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
              <CardContent className="p-4">
                <Button 
                  onClick={() => setShowMoneyTransfer(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  disabled={gamePhase !== 'waiting'}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Geld senden
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Andere Abenteurer</h3>
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
