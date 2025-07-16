import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const playerColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"
  ];

  const createLobby = () => {
    if (!playerName.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib deinen Spielernamen ein",
        variant: "destructive"
      });
      return;
    }

    const code = generateGameCode();
    setGameCode(code);
    setIsHost(true);
    setLobbyCreated(true);
    
    const hostPlayer: LobbyPlayer = {
      id: "host",
      name: playerName,
      isHost: true,
      avatar: playerName.charAt(0).toUpperCase(),
      color: playerColors[0]
    };
    
    setLobbyPlayers([hostPlayer]);
    
    toast({
      title: "🎮 Lobby erstellt!",
      description: `Spiel-Code: ${code}`,
    });
  };

  const joinLobby = () => {
    if (!playerName.trim() || !joinCode.trim()) {
      toast({
        title: "Angaben unvollständig",
        description: "Bitte gib deinen Namen und den Spiel-Code ein",
        variant: "destructive"
      });
      return;
    }

    // Simulate joining a lobby
    setGameCode(joinCode);
    setLobbyCreated(true);
    setIsHost(false);

    const newPlayer: LobbyPlayer = {
      id: playerName.toLowerCase(),
      name: playerName,
      isHost: false,
      avatar: playerName.charAt(0).toUpperCase(),
      color: playerColors[1]
    };

    setLobbyPlayers([
      {
        id: "host",
        name: "Gastgeber",
        isHost: true,
        avatar: "G",
        color: playerColors[0]
      },
      newPlayer
    ]);

    toast({
      title: "🎮 Lobby beigetreten!",
      description: `Erfolgreich dem Spiel ${joinCode} beigetreten`,
    });
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast({
      title: "📋 Code kopiert!",
      description: "Der Spiel-Code wurde in die Zwischenablage kopiert",
    });
  };

  const startGame = () => {
    if (lobbyPlayers.length < 2) {
      toast({
        title: "Nicht genug Spieler",
        description: "Mindestens 2 Spieler sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    // Pass lobby data to game
    const gameData = {
      players: lobbyPlayers,
      gameCode: gameCode
    };
    
    localStorage.setItem('monopoly-game-data', JSON.stringify(gameData));
    navigate("/game");
  };

  const addBotPlayer = () => {
    if (lobbyPlayers.length >= 8) return;
    
    const botNames = ["AI-Tycoon", "Robo-Millionär", "Cyber-Baron", "Digital-Mogul"];
    const availableColors = playerColors.filter(color => 
      !lobbyPlayers.some(player => player.color === color)
    );
    
    const newBot: LobbyPlayer = {
      id: `bot-${Date.now()}`,
      name: botNames[Math.floor(Math.random() * botNames.length)],
      isHost: false,
      avatar: "🤖",
      color: availableColors[0] || playerColors[lobbyPlayers.length]
    };

    setLobbyPlayers(prev => [...prev, newBot]);
    
    toast({
      title: "🤖 KI-Spieler hinzugefügt",
      description: `${newBot.name} ist der Lobby beigetreten`,
    });
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