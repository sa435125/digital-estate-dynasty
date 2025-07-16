import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UserX, Lock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LobbySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  lobbyId: string;
  isHost: boolean;
  players: Array<{ id: string; name: string; player_id: string; is_host: boolean }>;
  isPrivate: boolean;
  maxPlayers: number;
  onSettingsUpdate: () => void;
}

export function LobbySettings({
  isOpen,
  onClose,
  lobbyId,
  isHost,
  players,
  isPrivate,
  maxPlayers,
  onSettingsUpdate
}: LobbySettingsProps) {
  const [privateMode, setPrivateMode] = useState(isPrivate);
  const [maxPlayersCount, setMaxPlayersCount] = useState(maxPlayers);
  const { toast } = useToast();

  if (!isHost) return null;

  const updateLobbySettings = async () => {
    const { error } = await supabase
      .from('lobbies')
      .update({
        is_private: privateMode,
        max_players_setting: maxPlayersCount
      })
      .eq('id', lobbyId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Lobby-Einstellungen aktualisiert",
      });
      onSettingsUpdate();
      onClose();
    }
  };

  const kickPlayer = async (playerId: string) => {
    const { error } = await supabase
      .from('lobby_players')
      .delete()
      .eq('lobby_id', lobbyId)
      .eq('player_id', playerId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Spieler konnte nicht gekickt werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Spieler wurde gekickt",
      });
      onSettingsUpdate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lobby-Einstellungen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Lobby
                </Label>
                <p className="text-sm text-muted-foreground">
                  Andere Spieler können nicht beitreten
                </p>
              </div>
              <Switch
                checked={privateMode}
                onCheckedChange={setPrivateMode}
              />
            </div>

            <div className="space-y-2">
              <Label>Maximale Spieleranzahl</Label>
              <Input
                type="number"
                min={2}
                max={8}
                value={maxPlayersCount}
                onChange={(e) => setMaxPlayersCount(parseInt(e.target.value) || 2)}
              />
            </div>
          </div>

          <Separator />

          {/* Player Management */}
          <div className="space-y-4">
            <Label>Spieler verwalten</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {players.filter(p => !p.is_host).map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{player.name}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => kickPlayer(player.player_id)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {players.filter(p => !p.is_host).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine anderen Spieler in der Lobby
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button onClick={updateLobbySettings} className="flex-1">
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}