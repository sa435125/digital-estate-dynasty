import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { DiceRoller } from "@/components/game/DiceRoller";
import { PropertyCard } from "@/components/game/PropertyCard";
import { MoneyTransfer } from "@/components/game/MoneyTransfer";
import { PropertyOwnershipList } from "@/components/game/PropertyOwnershipList";
import { BankruptcyDialog } from "@/components/game/BankruptcyDialog";
import { HouseBuildingDialog } from "@/components/game/HouseBuildingDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Home, Send, Crown, Building, LogOut } from "lucide-react";
import { BOARD_PROPERTIES, Property } from "@/data/properties";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  color: string;
  properties: string[];
  inJail: boolean;
  jailTurns: number;
}

interface GameState {
  currentPlayerId: string;
  gamePhase: 'waiting' | 'rolling' | 'moving' | 'property' | 'rent' | 'finished';
  round: number;
  lastDiceRoll: {dice1: number, dice2: number} | null;
}

const Game = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayerId: '',
    gamePhase: 'waiting',
    round: 1,
    lastDiceRoll: null
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showMoneyTransfer, setShowMoneyTransfer] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [lobbyId, setLobbyId] = useState<string>("");
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>(BOARD_PROPERTIES);
  const [showBankruptcy, setShowBankruptcy] = useState(false);
  const [showHouseBuilding, setShowHouseBuilding] = useState(false);
  const [bankruptPlayer, setBankruptPlayer] = useState<Player | null>(null);

  // Initialize game from lobby data
  useEffect(() => {
    const gameData = localStorage.getItem('monopoly-game-data');
    console.log('Game data from localStorage:', gameData);
    
    if (!gameData) {
      console.log('No game data found, redirecting to lobby');
      navigate("/lobby");
      return;
    }

    const parsed = JSON.parse(gameData);
    console.log('Parsed game data:', parsed);
    
    if (!parsed.lobbyId) {
      console.error('No lobbyId in game data, redirecting to lobby');
      navigate("/lobby");
      return;
    }
    
    setGameCode(parsed.gameCode || "");
    setLobbyId(parsed.lobbyId);
    setCurrentPlayerId(parsed.playerId);
  }, [navigate]);

  // Initialize game when lobbyId is available
  useEffect(() => {
    if (!lobbyId) return;
    
    console.log('Initializing game for lobbyId:', lobbyId);
    const gameData = localStorage.getItem('monopoly-game-data');
    if (gameData) {
      const parsed = JSON.parse(gameData);
      initializeGame(parsed);
    }
  }, [lobbyId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!lobbyId) return;

    console.log('Setting up real-time subscriptions for lobbyId:', lobbyId);

    const gameStateChannel = supabase
      .channel(`game-state-${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('Game state updated:', payload);
          loadGameState();
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`game-players-${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('Player data updated:', payload);
          loadPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [lobbyId]);

  const initializeGame = async (parsed: any) => {
    try {
      // Check if game already exists
      const { data: existingGame } = await supabase
        .from('game_state')
        .select('*')
        .eq('lobby_id', parsed.lobbyId)
        .single();

      if (!existingGame) {
        // Create initial game state
        const { error: gameError } = await supabase
          .from('game_state')
          .insert({
            lobby_id: parsed.lobbyId,
            current_player_id: parsed.players[0].id,
            game_phase: 'waiting',
            round_number: 1
          });

        if (gameError) {
          console.error('Error creating game state:', gameError);
          return;
        }

        // Create initial player states
        const gamePlayersData = parsed.players.map((player: any) => ({
          lobby_id: parsed.lobbyId,
          player_id: player.id,
          name: player.name,
          money: 1500,
          position: 0,
          color: player.color,
          properties: [],
          in_jail: false,
          jail_turns: 0
        }));

        const { error: playersError } = await supabase
          .from('game_players')
          .insert(gamePlayersData);

        if (playersError) {
          console.error('Error creating players:', playersError);
          return;
        }
      }

      // Load current game state
      loadGameState();
      loadPlayers();

    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  const loadGameState = async () => {
    console.log('Loading game state for lobbyId:', lobbyId);
    if (!lobbyId) {
      console.error('No lobbyId available for loading game state');
      return;
    }

    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('lobby_id', lobbyId)
      .maybeSingle();

    if (error) {
      console.error('Error loading game state:', error);
      return;
    }

    if (!data) {
      console.log('No game state found, game might not be initialized yet');
      return;
    }

    console.log('Game state loaded:', data);
    setGameState({
      currentPlayerId: data.current_player_id,
      gamePhase: data.game_phase as 'waiting' | 'rolling' | 'moving' | 'property' | 'rent' | 'finished',
      round: data.round_number,
      lastDiceRoll: data.last_dice_roll as {dice1: number, dice2: number} | null
    });
  };

  const loadPlayers = async () => {
    console.log('Loading players for lobbyId:', lobbyId);
    if (!lobbyId) {
      console.error('No lobbyId available for loading players');
      return;
    }

    const { data, error } = await supabase
      .from('game_players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('created_at');

    if (error) {
      console.error('Error loading players:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No players found for this lobby');
      return;
    }

    console.log('Players loaded:', data);
    const formattedPlayers: Player[] = data.map(player => ({
      id: player.player_id,
      name: player.name,
      money: player.money,
      position: player.position,
      color: player.color,
      properties: player.properties || [],
      inJail: player.in_jail,
      jailTurns: player.jail_turns
    }));

    setPlayers(formattedPlayers);
  };

  const updateGameState = async (updates: Partial<GameState>) => {
    const { error } = await supabase
      .from('game_state')
      .update({
        current_player_id: updates.currentPlayerId,
        game_phase: updates.gamePhase,
        round_number: updates.round,
        last_dice_roll: updates.lastDiceRoll
      })
      .eq('lobby_id', lobbyId);

    if (error) {
      console.error('Error updating game state:', error);
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    const { error } = await supabase
      .from('game_players')
      .update({
        money: updates.money,
        position: updates.position,
        properties: updates.properties,
        in_jail: updates.inJail,
        jail_turns: updates.jailTurns
      })
      .eq('lobby_id', lobbyId)
      .eq('player_id', playerId);

    if (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleDiceRoll = async (dice1: number, dice2: number) => {
    // Only current player can roll
    if (gameState.currentPlayerId !== currentPlayerId) {
      toast({
        title: "Nicht dein Zug!",
        description: "Warte bis du dran bist",
        variant: "destructive"
      });
      return;
    }

    const diceSum = dice1 + dice2;
    const player = players.find(p => p.id === currentPlayerId);
    if (!player) return;

    // Update game state with dice roll
    await updateGameState({
      ...gameState,
      gamePhase: 'moving',
      lastDiceRoll: { dice1, dice2 }
    });

    if (player.inJail) {
      if (dice1 === dice2) {
        // Double - get out of jail
        const newPosition = (player.position + diceSum) % 40;
        await updatePlayer(player.id, {
          ...player,
          inJail: false,
          jailTurns: 0,
          position: newPosition
        });
        
        toast({
          title: "🔓 Pasch! Befreit!",
          description: `${player.name} entkommt dem Drachenverlies`,
        });

        // Handle property landing
        setTimeout(() => {
          const landedProperty = properties[newPosition];
          handlePropertyLanding(player, landedProperty, newPosition);
        }, 1500);
      } else {
        await updatePlayer(player.id, {
          ...player,
          jailTurns: player.jailTurns + 1
        });
        
        toast({
          title: "🔒 Noch gefangen",
          description: `${player.name} muss noch ${3 - (player.jailTurns + 1)} Runden im Verlies bleiben`,
        });
        
        // Next turn
        setTimeout(() => nextTurn(), 2000);
        return;
      }
    } else {
      // Move player
      const oldPosition = player.position;
      let newPosition = (oldPosition + diceSum) % 40;
      let newMoney = player.money;
      
      // Check if player passed "Nexus Plaza" (Start)
      if (newPosition < oldPosition || (oldPosition + diceSum >= 40)) {
        newMoney += 200;
        toast({
          title: "🌟 Durch Nexus Plaza!",
          description: `${player.name} erhält 200€ für die Reise`,
        });
      }
      
      await updatePlayer(player.id, {
        ...player,
        position: newPosition,
        money: newMoney
      });

      // Handle property landing after movement
      setTimeout(() => {
        const landedProperty = properties[newPosition];
        handlePropertyLanding(player, landedProperty, newPosition);
      }, 1500);
    }
  };

  const handlePropertyLanding = async (player: Player, property: Property, position: number) => {
    const propertyData = properties.find(p => p.id === property.id);
    
    console.log(`Player ${player.name} landed on position ${position}, property:`, propertyData);
    
    if (!propertyData || propertyData.type === 'special') {
      handleSpecialField(player, propertyData, position);
      return;
    }

    if (propertyData.owner && propertyData.owner !== parseInt(player.id)) {
      // Pay rent
      const rent = calculateRent(propertyData);
      const owner = players.find(p => parseInt(p.id) === propertyData.owner);
      
      if (rent > 0 && owner) {
        const actualPayment = Math.min(player.money, rent);
        
        // Check if player can't pay and becomes bankrupt
        if (player.money < rent) {
          setBankruptPlayer(player);
          setShowBankruptcy(true);
          return;
        }
        
        await updatePlayer(player.id, {
          ...player,
          money: player.money - actualPayment
        });
        
        await updatePlayer(owner.id, {
          ...owner,
          money: owner.money + actualPayment
        });
        
        toast({
          title: "🏠 Tribut gezahlt",
          description: `${player.name} zahlt ${actualPayment}€ an ${owner.name}`,
        });
      }
      nextTurn();
    } else if (!propertyData.owner && propertyData.price > 0) {
      // Property can be bought
      setSelectedProperty(propertyData);
      await updateGameState({ ...gameState, gamePhase: 'property' });
    } else {
      nextTurn();
    }
  };

  const handleSpecialField = async (player: Player, property: Property | undefined, position: number) => {
    console.log(`Player ${player.name} landed on special field at position ${position}:`, property);
    
    if (!property) {
      nextTurn();
      return;
    }

    let newMoney = player.money;
    let newPosition = player.position;
    let newInJail = player.inJail;

    switch (property.id) {
      case 'tax1':
        newMoney = Math.max(0, newMoney - 200);
        toast({
          title: "⚡ Gildensteuer",
          description: `${player.name} zahlt 200€ an die Händlergilde`,
        });
        break;
        
      case 'tax2':
        newMoney = Math.max(0, newMoney - 100);
        toast({
          title: "🐉 Drachensteuer",
          description: `${player.name} zahlt 100€ Tribut an den Drachen`,
        });
        break;
        
      case 'banish':
        newPosition = 10; // Prison position
        newInJail = true;
        toast({
          title: "🏰 Ins Drachenverlies!",
          description: `${player.name} wurde verbannt`,
        });
        break;
        
      default:
        if (property.id.includes('fortune') || property.id.includes('destiny')) {
          const bonuses = [0, 50, 100, 200, -50, -100];
          const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
          newMoney = Math.max(0, newMoney + bonus);
          toast({
            title: bonus >= 0 ? "🍀 Glück gehabt!" : "💸 Pech gehabt!",
            description: `${player.name} ${bonus >= 0 ? 'erhält' : 'verliert'} ${Math.abs(bonus)}€`,
          });
        }
    }
    
    await updatePlayer(player.id, {
      ...player,
      money: newMoney,
      position: newPosition,
      inJail: newInJail,
      jailTurns: newInJail ? 0 : player.jailTurns
    });
    
    setTimeout(() => nextTurn(), 2000);
  };

  const calculateRent = (property: Property): number => {
    console.log('Calculating rent for property:', property);
    
    if (property.type === 'railroad') {
      const ownedRailroads = properties.filter(p => 
        p.type === 'railroad' && p.owner === property.owner
      ).length;
      const rent = 25 * Math.pow(2, ownedRailroads - 1);
      console.log(`Railroad rent: ${rent} (${ownedRailroads} railroads)`);
      return rent;
    }
    
    if (property.type === 'utility') {
      const ownedUtilities = properties.filter(p => 
        p.type === 'utility' && p.owner === property.owner
      ).length;
      const multiplier = ownedUtilities === 1 ? 4 : 10;
      const diceSum = gameState.lastDiceRoll ? gameState.lastDiceRoll.dice1 + gameState.lastDiceRoll.dice2 : 7;
      const rent = diceSum * multiplier;
      console.log(`Utility rent: ${rent} (dice: ${diceSum}, multiplier: ${multiplier})`);
      return rent;
    }
    
    // Regular property - check for monopoly and houses
    const houses = property.houses || 0;
    const owner = players.find(p => parseInt(p.id) === property.owner);
    
    // Check if owner has monopoly for this color
    const colorGroup = properties.filter(p => p.color === property.color && p.type === 'property');
    const ownedInGroup = properties.filter(p => p.color === property.color && p.type === 'property' && p.owner === property.owner);
    const hasMonopoly = colorGroup.length === ownedInGroup.length;
    
    let rent = property.rent;
    
    if (houses === 0 && hasMonopoly) {
      rent = property.rent * 2; // Double rent for monopoly without houses
    } else if (houses === 1) {
      rent = property.rent * 5;
    } else if (houses === 2) {
      rent = property.rent * 15;
    } else if (houses === 3) {
      rent = property.rent * 45;
    } else if (houses === 4) {
      rent = property.rent * 80;
    } else if (houses === 5) {
      rent = property.rent * 110; // Hotel
    }
    
    console.log(`Property rent: ${rent} (base: ${property.rent}, houses: ${houses}, monopoly: ${hasMonopoly})`);
    return rent;
  };

  const handlePropertyPurchase = async (property: Property) => {
    const player = players.find(p => p.id === currentPlayerId);
    if (!player) return;
    
    console.log('Purchasing property:', property, 'for player:', player);
    
    if (player.money >= property.price) {
      // Update player in database
      await updatePlayer(player.id, {
        ...player,
        money: player.money - property.price,
        properties: [...player.properties, property.id]
      });
      
      // Update properties state locally
      setProperties(prev => {
        const newProperties = [...prev];
        const propertyIndex = newProperties.findIndex(p => p.id === property.id);
        if (propertyIndex !== -1) {
          newProperties[propertyIndex] = {
            ...newProperties[propertyIndex],
            owner: parseInt(player.id)
          };
        }
        console.log('Updated properties state:', newProperties);
        return newProperties;
      });
      
      toast({
        title: "🏰 Besitztum erworben!",
        description: `${player.name} hat ${property.name} für ${property.price.toLocaleString('de-DE')}€ gekauft`,
      });
    }
    
    setSelectedProperty(null);
    await updateGameState({ ...gameState, gamePhase: 'waiting' });
    nextTurn();
  };

  const handlePropertySkip = async () => {
    setSelectedProperty(null);
    await updateGameState({ ...gameState, gamePhase: 'waiting' });
    nextTurn();
  };

  const handleSellProperty = async (propertyId: string) => {
    const player = bankruptPlayer;
    if (!player) return;

    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const sellPrice = Math.floor(property.price * 0.5);
    
    await updatePlayer(player.id, {
      ...player,
      money: player.money + sellPrice,
      properties: player.properties.filter(id => id !== propertyId)
    });

    setProperties(prev => {
      const newProperties = [...prev];
      const propertyIndex = newProperties.findIndex(p => p.id === propertyId);
      newProperties[propertyIndex].owner = undefined;
      newProperties[propertyIndex].houses = 0;
      return newProperties;
    });

    toast({
      title: "🏠 Immobilie verkauft",
      description: `${property.name} für ${sellPrice.toLocaleString('de-DE')}€ verkauft`,
    });

    setShowBankruptcy(false);
    setBankruptPlayer(null);
  };

  const handlePlayerGiveUp = async () => {
    const player = bankruptPlayer;
    if (!player) return;

    // Free all properties
    const playerProperties = properties.filter(p => p.owner === parseInt(player.id));
    setProperties(prev => {
      const newProperties = [...prev];
      playerProperties.forEach(prop => {
        const index = newProperties.findIndex(p => p.id === prop.id);
        newProperties[index].owner = undefined;
        newProperties[index].houses = 0;
      });
      return newProperties;
    });

    // Mark player as bankrupt
    await updatePlayer(player.id, {
      ...player,
      money: 0,
      properties: []
    });

    toast({
      title: "💸 Spieler aufgegeben",
      description: `${player.name} hat aufgegeben. Alle Immobilien sind wieder frei.`,
    });

    setShowBankruptcy(false);
    setBankruptPlayer(null);
    nextTurn();
  };

  const handleBuildHouse = async (propertyId: string, houses: number) => {
    const player = players.find(p => p.id === currentPlayerId);
    const property = properties.find(p => p.id === propertyId);
    if (!player || !property) return;

    const cost = Math.floor(property.price * 0.5) * houses;
    
    await updatePlayer(player.id, {
      ...player,
      money: player.money - cost
    });

    setProperties(prev => {
      const newProperties = [...prev];
      const propertyIndex = newProperties.findIndex(p => p.id === propertyId);
      newProperties[propertyIndex].houses = (newProperties[propertyIndex].houses || 0) + houses;
      return newProperties;
    });

    toast({
      title: "🏗️ Häuser gebaut",
      description: `${houses} ${houses === 1 ? 'Haus' : 'Häuser'} auf ${property.name} gebaut`,
    });
  };

  const nextTurn = async () => {
    const currentIndex = players.findIndex(p => p.id === gameState.currentPlayerId);
    let nextIndex = (currentIndex + 1) % players.length;
    
    // Skip bankrupt players
    while (players[nextIndex]?.money <= 0 && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    
    const newRound = nextIndex === 0 ? gameState.round + 1 : gameState.round;
    
    console.log(`Next turn: from player ${gameState.currentPlayerId} to player ${players[nextIndex]?.id}`);
    
    await updateGameState({
      ...gameState,
      currentPlayerId: players[nextIndex].id,
      gamePhase: 'waiting',
      round: newRound
    });
    
    toast({
      title: "🎲 Nächster Spieler",
      description: `${players[nextIndex].name} ist dran`,
    });
  };

  const currentPlayer = players.find(p => p.id === gameState.currentPlayerId);
  const myPlayer = players.find(p => p.id === currentPlayerId);
  
  if (gameState.gamePhase === 'finished') {
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

  if (!currentPlayer || !myPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Spiel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm px-2 sm:px-3" 
              onClick={() => navigate('/lobby')}
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Lobby verlassen</span>
              <span className="sm:hidden">Exit</span>
            </Button>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">Mystisches Reich</h1>
            {gameCode && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm">
                {gameCode}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 bg-slate-700 text-white">
              R{gameState.round}
            </Badge>
            <Badge className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <span className="hidden sm:inline">{currentPlayer.name} ist dran</span>
              <span className="sm:hidden">{currentPlayer.name}</span>
            </Badge>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-3">
            {/* Game Board - Main focus on mobile */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700 border-2 shadow-2xl">
              <CardContent className="p-1 sm:p-2">
                <GameBoard
                  players={players.map(p => ({
                    id: parseInt(p.id),
                    name: p.name,
                    money: p.money,
                    position: p.position,
                    color: p.color,
                    properties: p.properties
                  }))}
                />
              </CardContent>
            </Card>

            {/* Mobile Bottom Controls */}
            <div className="grid grid-cols-2 gap-3">
              {/* Current Player Quick Info */}
              <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-3 h-3 rounded-full", currentPlayer.color)}></div>
                    <span className="text-white font-medium text-sm">{currentPlayer.name}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs w-full justify-center">
                    {currentPlayer.money.toLocaleString('de-DE')}€
                  </Badge>
                </CardContent>
              </Card>

              {/* Dice Controls */}
              <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
                <CardContent className="p-3">
                  <Button
                    onClick={() => {
                      const dice1 = Math.floor(Math.random() * 6) + 1;
                      const dice2 = Math.floor(Math.random() * 6) + 1;
                      handleDiceRoll(dice1, dice2);
                    }}
                    disabled={gameState.gamePhase !== 'waiting' || gameState.currentPlayerId !== currentPlayerId}
                    className="w-full text-sm py-2"
                    size="sm"
                  >
                    {gameState.gamePhase === 'moving' ? "Würfelt..." : "🎲 Würfeln"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Compact Players Strip */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
              <CardContent className="p-2">
                <div className="flex justify-between items-center text-xs">
                  {players.map((player, index) => (
                    <div key={player.id} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                        player.color,
                        gameState.currentPlayerId === player.id && "ring-2 ring-yellow-400"
                      )}>
                        <span className="text-white font-bold text-xs">{player.name.charAt(0)}</span>
                      </div>
                      <span className="text-white text-xs">{Math.round(player.money / 1000)}k€</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Property Ownership */}
            <PropertyOwnershipList players={players} properties={properties} />

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setShowMoneyTransfer(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={gameState.gamePhase !== 'waiting'}
                size="sm"
              >
                <Send className="h-2 w-2 mr-1" />
                💰
              </Button>
              <Button
                onClick={() => setShowHouseBuilding(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={gameState.gamePhase !== 'waiting' || gameState.currentPlayerId !== currentPlayerId}
                size="sm"
              >
                <Building className="h-2 w-2 mr-1" />
                🏠
              </Button>
              <Button
                onClick={() => navigate('/lobby')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                size="sm"
              >
                <LogOut className="h-2 w-2 mr-1" />
                🚪
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700 border-2 shadow-2xl">
              <CardContent className="p-6">
                <GameBoard 
                  players={players.map(p => ({
                    id: parseInt(p.id),
                    name: p.name,
                    money: p.money,
                    position: p.position,
                    color: p.color,
                    properties: p.properties
                  }))} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* Dice Roller */}
            <DiceRoller
              onRoll={handleDiceRoll}
              disabled={gameState.gamePhase !== 'waiting' || gameState.currentPlayerId !== currentPlayerId}
              isRolling={gameState.gamePhase === 'rolling' || gameState.gamePhase === 'moving'}
            />

            {/* My Player Panel */}
            <PlayerPanel
              player={{
                id: parseInt(myPlayer.id),
                name: myPlayer.name,
                money: myPlayer.money,
                position: myPlayer.position,
                color: myPlayer.color,
                properties: myPlayer.properties,
                inJail: myPlayer.inJail,
                jailTurns: myPlayer.jailTurns
              }}
              isCurrentPlayer={gameState.currentPlayerId === currentPlayerId}
              gamePhase={gameState.gamePhase}
            />

            {/* Property Ownership */}
            <PropertyOwnershipList players={players} properties={properties} />

            {/* All Players */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Alle Spieler</h3>
              {players.map((player) => (
                <PlayerPanel
                  key={player.id}
                  player={{
                    id: parseInt(player.id),
                    name: player.name,
                    money: player.money,
                    position: player.position,
                    color: player.color,
                    properties: player.properties,
                    inJail: player.inJail,
                    jailTurns: player.jailTurns
                  }}
                  isCurrentPlayer={gameState.currentPlayerId === player.id}
                  gamePhase={gameState.gamePhase}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowMoneyTransfer(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={gameState.gamePhase !== 'waiting'}
              >
                <Send className="h-4 w-4 mr-2" />
                Geld senden
              </Button>
              
              <Button
                onClick={() => setShowHouseBuilding(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                disabled={gameState.gamePhase !== 'waiting' || gameState.currentPlayerId !== currentPlayerId}
              >
                <Building className="h-4 w-4 mr-2" />
                Häuser bauen
              </Button>
            </div>
          </div>
        </div>

        {/* Property Modal */}
        {selectedProperty && (
          <PropertyCard
            property={selectedProperty}
            onBuy={() => handlePropertyPurchase(selectedProperty)}
            onClose={() => handlePropertySkip()}
            canBuy={gameState.gamePhase === 'property' && gameState.currentPlayerId === currentPlayerId && !selectedProperty.owner}
          />
        )}

        {/* Bankruptcy Dialog */}
        {bankruptPlayer && (
          <BankruptcyDialog
            player={bankruptPlayer}
            properties={properties}
            onSellProperty={handleSellProperty}
            onGiveUp={handlePlayerGiveUp}
            isOpen={showBankruptcy}
          />
        )}

        {/* House Building Dialog */}
        <HouseBuildingDialog
          player={myPlayer}
          properties={properties}
          onBuildHouse={handleBuildHouse}
          isOpen={showHouseBuilding}
          onClose={() => setShowHouseBuilding(false)}
        />

        {/* Money Transfer Modal */}
        {showMoneyTransfer && (
          <MoneyTransfer
            isOpen={showMoneyTransfer}
            currentPlayer={{
              id: parseInt(myPlayer.id),
              name: myPlayer.name,
              money: myPlayer.money,
              position: myPlayer.position,
              color: myPlayer.color,
              properties: myPlayer.properties
            }}
            allPlayers={players.map(p => ({
              id: parseInt(p.id),
              name: p.name,
              money: p.money,
              position: p.position,
              color: p.color,
              properties: p.properties
            }))}
            onTransfer={async (fromId, toId, amount) => {
              const fromPlayer = players.find(p => parseInt(p.id) === fromId);
              const toPlayer = players.find(p => parseInt(p.id) === toId);
              if (fromPlayer && toPlayer) {
                await updatePlayer(fromPlayer.id, { ...fromPlayer, money: fromPlayer.money - amount });
                await updatePlayer(toPlayer.id, { ...toPlayer, money: toPlayer.money + amount });
              }
            }}
            onClose={() => setShowMoneyTransfer(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Game;