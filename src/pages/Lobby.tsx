import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Play, ArrowLeft, Settings, Plus, Lock, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LobbySettings } from "@/components/game/LobbySettings";

interface LobbyData {
  id: string;
  code: string;
  status: string;
  host_id: string;
  is_private: boolean;
  max_players_setting: number;
}

interface LobbyPlayer {
  id: string;
  name: string;
  player_id: string;
  is_host: boolean;
  avatar: string;
  color: string;
}

export default function Lobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameMode, setGameMode] = useState<'create' | 'join' | 'browse' | null>(
    searchParams.get('mode') === 'join' ? 'join' : null
  );
  const [gameCode, setGameCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [lobbyCreated, setLobbyCreated] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [publicLobbies, setPublicLobbies] = useState<any[]>([]);
  const [showPublicLobbies, setShowPublicLobbies] = useState(false);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const playerColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"
  ];

  useEffect(() => {
    loadPublicLobbies();
  }, []);

  const loadPublicLobbies = async () => {
    const { data, error } = await supabase
      .from('lobbies')
      .select(`
        *,
        lobby_players(*)
      `)
      .eq('is_private', false)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (data) {
      setPublicLobbies(data);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert!",
        description: "Lobby-Code wurde in die Zwischenablage kopiert",
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Code konnte nicht kopiert werden",
        variant: "destructive",
      });
    }
  };

  const createLobby = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib einen Spielernamen ein",
        variant: "destructive",
      });
      return;
    }

    const code = generateGameCode();
    const newPlayerId = `player-${Date.now()}`;
    
    try {
      // Create lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .insert({
          code,
          game_mode: 'classic',
          status: 'waiting',
          is_private: false,
          max_players_setting: 8
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      // Add player to lobby
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert({
          lobby_id: lobbyData.id,
          player_id: newPlayerId,
          name: playerName.trim(),
          avatar: '👤',
          color: playerColors[0],
          is_host: true
        });

      if (playerError) throw playerError;

      setGameCode(code);
      setLobbyId(lobbyData.id);
      setLobbyData(lobbyData);
      setPlayerId(newPlayerId);
      setIsHost(true);
      setLobbyCreated(true);
      loadLobbyPlayers(lobbyData.id);

    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Lobby konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const joinLobby = async (code?: string) => {
    const codeToJoin = code || joinCode.trim().toUpperCase();
    
    if (!codeToJoin) {
      toast({
        title: "Code erforderlich",
        description: "Bitte gib einen Lobby-Code ein",
        variant: "destructive",
      });
      return;
    }

    if (!playerName.trim()) {
      toast({
        title: "Name erforderlich",
        description: "Bitte gib einen Spielernamen ein",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', codeToJoin)
        .eq('status', 'waiting')
        .single();

      if (lobbyError || !lobbyData) {
        toast({
          title: "Lobby nicht gefunden",
          description: "Überprüfe den Code und versuche es erneut",
          variant: "destructive",
        });
        return;
      }

      // Check if lobby is full
      const { count } = await supabase
        .from('lobby_players')
        .select('*', { count: 'exact', head: true })
        .eq('lobby_id', lobbyData.id);

      if (count && count >= lobbyData.max_players_setting) {
        toast({
          title: "Lobby voll",
          description: "Diese Lobby hat bereits die maximale Anzahl an Spielern",
          variant: "destructive",
        });
        return;
      }

      // Check if lobby is private
      if (lobbyData.is_private) {
        toast({
          title: "Private Lobby",
          description: "Diese Lobby ist privat und kann nicht betreten werden",
          variant: "destructive",
        });
        return;
      }

      const newPlayerId = `player-${Date.now()}`;
      const availableColors = playerColors.filter((color, index) => 
        !lobbyPlayers.some(p => p.color === color)
      );

      // Add player to lobby
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert({
          lobby_id: lobbyData.id,
          player_id: newPlayerId,
          name: playerName.trim(),
          avatar: '👤',
          color: availableColors[0] || playerColors[0],
          is_host: false
        });

      if (playerError) throw playerError;

      setGameCode(lobbyData.code);
      setLobbyId(lobbyData.id);
      setLobbyData(lobbyData);
      setPlayerId(newPlayerId);
      setIsHost(false);
      setLobbyCreated(true);
      loadLobbyPlayers(lobbyData.id);

    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Lobby konnte nicht beigetreten werden",
        variant: "destructive",
      });
    }
  };

  const loadLobbyPlayers = async (currentLobbyId: string) => {
    const { data, error } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_id', currentLobbyId)
      .order('joined_at', { ascending: true });

    if (data) {
      setLobbyPlayers(data.map(p => ({
        id: p.id,
        name: p.name,
        player_id: p.player_id,
        is_host: p.is_host,
        avatar: p.avatar,
        color: p.color
      })));
    }
  };

const startGame = async () => {
  if (!lobbyId) {
    toast({ title: "Fehler", description: "Lobby nicht gefunden", variant: "destructive" });
    return;
  }
  if (!playerId) {
    toast({ title: "Fehler", description: "Spieler-ID fehlt", variant: "destructive" });
    return;
  }
  if (lobbyPlayers.length < 2) {
    toast({ title: "Zu wenige Spieler", description: "Mindestens 2 Spieler werden benötigt", variant: "destructive" });
    return;
  }
  try {
    const { error } = await supabase
      .from('lobbies')
      .update({ status: 'playing' })
      .eq('id', lobbyId);
    if (error) throw error;

    const initialGameData = {
      lobbyId,
      playerId,
      // ggf. weitere Felder
    };
    localStorage.setItem("gameData", JSON.stringify(initialGameData));

    navigate(/game?lobby=${lobbyId}&player=${playerId});
  } catch (error: any) {
    toast({ title: "Fehler", description: error.message || "Spiel konnte nicht gestartet werden", variant: "destructive" });
  }
};

  const onSettingsUpdate = () => {
    if (lobbyId) {
      loadLobbyData();
      loadLobbyPlayers(lobbyId);
    }
    loadPublicLobbies();
  };

  const loadLobbyData = async () => {
    if (!lobbyId) return;
    
    const { data } = await supabase
      .from('lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single();
    
    if (data) {
      setLobbyData(data);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby_${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => {
          loadLobbyPlayers(lobbyId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  if (lobbyCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-glow p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              {lobbyData?.is_private && <Lock className="h-4 w-4 text-white" />}
              {!lobbyData?.is_private && <Globe className="h-4 w-4 text-white" />}
              <span className="text-white text-sm">
                {lobbyData?.is_private ? 'Private Lobby' : 'Öffentliche Lobby'}
              </span>
            </div>
          </div>

          <Card className="bg-white/95 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Lobby: {gameCode}</CardTitle>
                  <p className="text-muted-foreground">
                    Spieler: {lobbyPlayers.length}/{lobbyData?.max_players_setting || 8}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(gameCode)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Code kopieren
                  </Button>
                  {isHost && (
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Einstellungen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {lobbyPlayers.map((player) => (
                  <Card key={player.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${player.color} flex items-center justify-center text-white font-bold`}>
                          {player.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          {player.is_host && (
                            <Badge variant="outline" className="text-xs">
                              Host
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {isHost && (
                <div className="flex justify-center">
                  <Button 
                    onClick={startGame}
                    disabled={lobbyPlayers.length < 2}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Spiel starten
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showSettings && lobbyData && (
          <LobbySettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            lobbyId={lobbyId!}
            isHost={isHost}
            players={lobbyPlayers}
            isPrivate={lobbyData.is_private}
            maxPlayers={lobbyData.max_players_setting}
            onSettingsUpdate={onSettingsUpdate}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-glow p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
        </div>

        <Card className="bg-white/95 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">FastEstate Lobby</CardTitle>
            <p className="text-muted-foreground">Erstelle eine Lobby oder tritt einer bei</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!gameMode && (
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => setGameMode('create')}
                  className="h-16 text-lg"
                >
                  <Plus className="mr-2 h-6 w-6" />
                  Neue Lobby erstellen
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setGameMode('join')}
                  className="h-16 text-lg"
                >
                  <Users className="mr-2 h-6 w-6" />
                  Lobby beitreten
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setShowPublicLobbies(!showPublicLobbies)}
                  className="h-16 text-lg"
                >
                  <Globe className="mr-2 h-6 w-6" />
                  Öffentliche Lobbys ({publicLobbies.length})
                </Button>

                {showPublicLobbies && publicLobbies.length > 0 && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold">Verfügbare öffentliche Lobbys:</h3>
                    {publicLobbies.map((lobby) => (
                      <div key={lobby.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <div className="font-medium">Code: {lobby.code}</div>
                          <div className="text-sm text-muted-foreground">
                            Spieler: {lobby.lobby_players?.length || 0}/{lobby.max_players_setting}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (playerName.trim()) {
                              joinLobby(lobby.code);
                            } else {
                              toast({
                                title: "Name erforderlich",
                                description: "Bitte gib zuerst einen Spielernamen ein",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Beitreten
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {gameMode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spielername
                  </label>
                  <Input
                    type="text"
                    placeholder="Gib deinen Namen ein..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                </div>

                {gameMode === 'create' && (
                  <Button onClick={createLobby} className="w-full h-12">
                    Lobby erstellen
                  </Button>
                )}

                {gameMode === 'join' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Lobby-Code
                      </label>
                      <Input
                        type="text"
                        placeholder="6-stelliger Code..."
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                      />
                    </div>
                    <Button onClick={() => joinLobby()} className="w-full h-12">
                      Lobby beitreten
                    </Button>
                  </>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => setGameMode(null)}
                  className="w-full"
                >
                  Zurück
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
