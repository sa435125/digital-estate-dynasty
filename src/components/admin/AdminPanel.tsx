import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, GamepadIcon, Shield, Coins, Ban, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'vip' | 'user';
  gold: number;
  is_banned: boolean;
  created_at: string;
}

interface GameStats {
  totalUsers: number;
  activeGames: number;
  totalLobbies: number;
}

export function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({ totalUsers: 0, activeGames: 0, totalLobbies: 0 });
  const [goldAmount, setGoldAmount] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
    loadGameStats();
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Profile konnten nicht geladen werden",
        variant: "destructive"
      });
    } else {
      setProfiles(data || []);
    }
  };

  const loadGameStats = async () => {
    // Total users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active games
    const { count: gameCount } = await supabase
      .from('game_state')
      .select('*', { count: 'exact', head: true })
      .neq('game_phase', 'finished');

    // Total lobbies
    const { count: lobbyCount } = await supabase
      .from('lobbies')
      .select('*', { count: 'exact', head: true });

    setGameStats({
      totalUsers: userCount || 0,
      activeGames: gameCount || 0,
      totalLobbies: lobbyCount || 0
    });
  };

  const giveGold = async (userId: string, amount: number) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('gold')
      .eq('id', userId)
      .single();

    const newGold = (profile?.gold || 0) + amount;

    const { error } = await supabase
      .from('profiles')
      .update({ gold: newGold })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Gold konnte nicht hinzugefügt werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: `${amount} Gold hinzugefügt`,
      });
      loadProfiles();
      setGoldAmount(prev => ({ ...prev, [userId]: 0 }));
    }
  };

  const banUser = async (userId: string, ban: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: ban })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Benutzer-Status konnte nicht geändert werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: ban ? "Benutzer gebannt" : "Bann aufgehoben",
      });
      loadProfiles();
    }
  };

  const promoteToVip = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'vip' })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Fehler",
        description: "VIP-Status konnte nicht vergeben werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Benutzer zu VIP befördert",
      });
      loadProfiles();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Spiele</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.activeGames}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Lobbies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.totalLobbies}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.display_name || profile.email}</span>
                    {profile.role === 'admin' && (
                      <Badge variant="destructive">(Admin)</Badge>
                    )}
                    {profile.role === 'vip' && (
                      <Badge className="bg-yellow-500 text-white">(VIP)</Badge>
                    )}
                    {profile.is_banned && (
                      <Badge variant="destructive">Gebannt</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {profile.email} • {profile.gold} Gold • Registriert: {new Date(profile.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Gold"
                      value={goldAmount[profile.id] || ''}
                      onChange={(e) => setGoldAmount(prev => ({ 
                        ...prev, 
                        [profile.id]: parseInt(e.target.value) || 0 
                      }))}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      onClick={() => giveGold(profile.id, goldAmount[profile.id] || 0)}
                      disabled={!goldAmount[profile.id] || goldAmount[profile.id] <= 0}
                    >
                      <Coins className="h-4 w-4" />
                    </Button>
                  </div>

                  {profile.role !== 'vip' && profile.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => promoteToVip(profile.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  )}

                  {profile.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant={profile.is_banned ? "outline" : "destructive"}
                      onClick={() => banUser(profile.id, !profile.is_banned)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}