import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Copy, 
  Users, 
  Play, 
  Crown, 
  UserPlus,
  ArrowLeft,
  Settings,
  Gamepad2
} from "lucide-react";

interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  avatar: string;
  color: string;
}

const Lobby = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameMode, setGameMode] = useState<'create' | 'join' | null>(null);
  const [gameCode, setGameCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [lobbyCreated, setLobbyCreated] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>("");

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const playerColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"
  ];

  // Real-time subscription for lobby updates
  useEffect(() => {
    if (!lobbyId) return;

    console.log('Setting up subscription for lobby:', lobbyId);

    const channel = supabase
      .channel(`lobby-players-${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('New player joined:', payload);
          setTimeout(() => loadLobbyPlayers(), 200);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('Player left:', payload);
          setTimeout(() => loadLobbyPlayers(), 200);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          // Load players when subscription is ready
          setTimeout(() => loadLobbyPlayers(), 300);
        }
      });

    return () => {
      console.log('Cleaning up subscription for lobby:', lobbyId);
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  const loadLobbyPlayers = async () => {
    if (!lobbyId) return;

    console.log('Loading players for lobby:', lobbyId);

    const { data: players, error } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error loading players:', error);
      return;
    }

    console.log('Loaded players from DB:', players);

    const formattedPlayers: LobbyPlayer[] = players.map((player, index) => ({
      id: player.player_id,
      name: player.name,
      isHost: player.is_host,
      avatar: player.avatar,
      color: player.color
    }));

    console.log('Formatted players:', formattedPlayers);
    setLobbyPlayers(formattedPlayers);
  };

  const createLobby = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib deinen Spielernamen ein",
        variant: "destructive"
      });
      return;
    }

    const code = generateGameCode();
    const hostPlayerId = crypto.randomUUID();
    
    try {
      // Create lobby in database
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .insert({
          code: code,
          host_id: hostPlayerId,
          game_mode: 'classic',
          status: 'waiting'
        })
        .select()
        .single();

      if (lobbyError) {
        console.error('Lobby creation error:', lobbyError);
        toast({
          title: "Fehler beim Erstellen",
          description: `Lobby konnte nicht erstellt werden: ${lobbyError.message}`,
          variant: "destructive"
        });
        return;
      }

      // Add host as first player
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert({
          lobby_id: lobby.id,
          player_id: hostPlayerId,
          name: playerName,
          avatar: playerName.charAt(0).toUpperCase(),
          color: playerColors[0],
          is_host: true
        });

      if (playerError) {
        toast({
          title: "Fehler beim Beitreten",
          description: "Konnte Lobby nicht beitreten",
          variant: "destructive"
        });
        return;
      }

      setGameCode(code);
      setLobbyId(lobby.id);
      setPlayerId(hostPlayerId);
      setIsHost(true);
      setLobbyCreated(true);
      
      toast({
        title: "🎮 Lobby erstellt!",
        description: `Spiel-Code: ${code}`,
      });

      // Force reload players after creating
      setTimeout(() => {
        console.log('Force loading players after create');
        loadLobbyPlayers();
      }, 1000);
    } catch (error) {
      console.error('Error creating lobby:', error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Erstellen der Lobby",
        variant: "destructive"
      });
    }
  };

  const joinLobby = async () => {
    if (!playerName.trim() || !joinCode.trim()) {
      toast({
        title: "Angaben unvollständig",
        description: "Bitte gib deinen Namen und den Spiel-Code ein",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find lobby by code
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (lobbyError || !lobby) {
        toast({
          title: "Lobby nicht gefunden",
          description: "Spiel-Code ungültig oder Spiel bereits gestartet",
          variant: "destructive"
        });
        return;
      }

      // Check if lobby is full
      const { count } = await supabase
        .from('lobby_players')
        .select('*', { count: 'exact', head: true })
        .eq('lobby_id', lobby.id);

      if (count && count >= 8) {
        toast({
          title: "Lobby voll",
          description: "Diese Lobby ist bereits voll",
          variant: "destructive"
        });
        return;
      }

      // Add player to lobby
      const newPlayerId = crypto.randomUUID();
      const availableColors = playerColors.filter((color, index) => index < 8);
      const playerColor = availableColors[count || 0] || playerColors[0];

      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert({
          lobby_id: lobby.id,
          player_id: newPlayerId,
          name: playerName,
          avatar: playerName.charAt(0).toUpperCase(),
          color: playerColor,
          is_host: false
        });

      if (playerError) {
        toast({
          title: "Fehler beim Beitreten",
          description: "Konnte Lobby nicht beitreten",
          variant: "destructive"
        });
        return;
      }

      setGameCode(joinCode.toUpperCase());
      setLobbyId(lobby.id);
      setPlayerId(newPlayerId);
      setIsHost(false);
      setLobbyCreated(true);

      toast({
        title: "🎮 Lobby beigetreten!",
        description: `Erfolgreich dem Spiel ${joinCode} beigetreten`,
      });

      // Force reload players after joining
      setTimeout(() => {
        console.log('Force loading players after join');
        loadLobbyPlayers();
      }, 1000);
    } catch (error) {
      console.error('Error joining lobby:', error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Beitreten der Lobby",
        variant: "destructive"
      });
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast({
      title: "📋 Code kopiert!",
      description: "Der Spiel-Code wurde in die Zwischenablage kopiert",
    });
  };

  const startGame = async () => {
    if (lobbyPlayers.length < 2) {
      toast({
        title: "Nicht genug Spieler",
        description: "Mindestens 2 Spieler sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    if (!isHost || !lobbyId) return;

    try {
      // Update lobby status to started
      const { error } = await supabase
        .from('lobbies')
        .update({ status: 'started' })
        .eq('id', lobbyId);

      if (error) {
        toast({
          title: "Fehler beim Starten",
          description: "Spiel konnte nicht gestartet werden",
          variant: "destructive"
        });
        return;
      }

      // Pass lobby data to game
      const gameData = {
        players: lobbyPlayers,
        gameCode: gameCode,
        lobbyId: lobbyId
      };
      
      localStorage.setItem('monopoly-game-data', JSON.stringify(gameData));
      navigate("/game");
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Starten des Spiels",
        variant: "destructive"
      });
    }
  };

  const addBotPlayer = async () => {
    if (lobbyPlayers.length >= 8 || !isHost || !lobbyId) return;
    
    const botNames = ["AI-Tycoon", "Robo-Millionär", "Cyber-Baron", "Digital-Mogul"];
    const availableColors = playerColors.filter(color => 
      !lobbyPlayers.some(player => player.color === color)
    );
    
    const botId = crypto.randomUUID();
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const botColor = availableColors[0] || playerColors[lobbyPlayers.length];

    try {
      const { error } = await supabase
        .from('lobby_players')
        .insert({
          lobby_id: lobbyId,
          player_id: botId,
          name: botName,
          avatar: "🤖",
          color: botColor,
          is_host: false
        });

      if (error) {
        toast({
          title: "Fehler",
          description: "Bot konnte nicht hinzugefügt werden",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "🤖 KI-Spieler hinzugefügt",
        description: `${botName} ist der Lobby beigetreten`,
      });
    } catch (error) {
      console.error('Error adding bot:', error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Hinzufügen des Bots",
        variant: "destructive"
      });
    }
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-xl border-slate-700 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Spiel beitreten oder erstellen</CardTitle>
            <p className="text-slate-300">Wähle aus, ob du ein neues Spiel erstellen oder einem bestehenden beitreten möchtest</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button 
              onClick={() => setGameMode('create')}
              className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl"
            >
              <Crown className="h-6 w-6 mr-3" />
              Neues Spiel erstellen
            </Button>
            
            <Button 
              onClick={() => setGameMode('join')}
              variant="outline"
              className="w-full h-16 text-lg border-slate-600 text-slate-300 hover:bg-slate-700 font-semibold rounded-xl"
            >
              <UserPlus className="h-6 w-6 mr-3" />
              Spiel beitreten
            </Button>
            
            <Button 
              onClick={() => navigate("/")}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Hauptmenü
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lobbyCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border-slate-700 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {gameMode === 'create' ? 'Lobby erstellen' : 'Lobby beitreten'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Dein Name
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Spielername eingeben..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            
            {gameMode === 'join' && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Spiel-Code
                </label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 font-mono text-center text-lg"
                  maxLength={6}
                />
              </div>
            )}
            
            <Button 
              onClick={gameMode === 'create' ? createLobby : joinLobby}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {gameMode === 'create' ? 'Lobby erstellen' : 'Lobby beitreten'}
            </Button>
            
            <Button 
              onClick={() => setGameMode(null)}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-slate-800/90 backdrop-blur-xl border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="h-5 w-5 text-white" />
                  </div>
                  Spiel-Lobby
                </CardTitle>
                <p className="text-slate-300 mt-1">Warte auf andere Spieler oder starte das Spiel</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-300">Spiel-Code:</span>
                  <Badge className="text-lg font-mono bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                    {gameCode}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={copyGameCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  {lobbyPlayers.length}/8 Spieler
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Players */}
        <Card className="mb-6 bg-slate-800/90 backdrop-blur-xl border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Spieler in der Lobby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lobbyPlayers.map((player) => (
                <Card key={player.id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4 text-center">
                    <Avatar className={`mx-auto mb-3 w-12 h-12 ${player.color} border-2 border-white`}>
                      <AvatarFallback className="text-white font-bold">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-white font-medium flex items-center justify-center gap-2">
                      {player.name}
                      {player.isHost && <Crown className="h-4 w-4 text-yellow-400" />}
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs border-slate-500 text-slate-300">
                      {player.isHost ? 'Gastgeber' : 'Spieler'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Bot Button */}
              {isHost && lobbyPlayers.length < 8 && (
                <Card className="bg-slate-700/30 border-slate-600 border-dashed">
                  <CardContent className="p-4 text-center">
                    <Button 
                      onClick={addBotPlayer}
                      variant="ghost"
                      className="w-full h-full text-slate-400 hover:text-white hover:bg-slate-600/50"
                    >
                      <div className="text-center">
                        <UserPlus className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">KI-Spieler hinzufügen</div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {isHost ? (
            <>
              <Button 
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                disabled={lobbyPlayers.length < 2}
              >
                <Play className="h-5 w-5 mr-2" />
                Spiel starten
              </Button>
              <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Settings className="h-5 w-5 mr-2" />
                Einstellungen
              </Button>
            </>
          ) : (
            <div className="text-center text-slate-300">
              <div className="animate-pulse">Warte auf den Gastgeber...</div>
            </div>
          )}
          
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Lobby verlassen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;