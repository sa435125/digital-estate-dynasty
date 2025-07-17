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
  vip_expires_at?: string;
  ban_expires_at?: string;
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: 'vip',
        vip_expires_at: expiresAt.toISOString()
      })
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
        description: "Benutzer zu VIP befördert (30 Tage)",
      });
      loadProfiles();
    }
  };

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Admin-Status konnte nicht vergeben werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Benutzer zu Admin befördert",
      });
      loadProfiles();
    }
  };

  const banUserWithDuration = async (userId: string, days: number) => {
    let banExpires = null;
    if (days > 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      banExpires = expiresAt.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_banned: true,
        ban_expires_at: banExpires
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gebannt werden",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolg",
        description: days > 0 ? `Benutzer für ${days} Tage gebannt` : "Benutzer permanent gebannt",
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
                     {profile.vip_expires_at && (
                       <span className="text-yellow-600"> • VIP bis: {new Date(profile.vip_expires_at).toLocaleDateString('de-DE')}</span>
                     )}
                     {profile.ban_expires_at && (
                       <span className="text-red-600"> • Gebannt bis: {new Date(profile.ban_expires_at).toLocaleDateString('de-DE')}</span>
                     )}
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

                   {profile.role === 'user' && (
                     <>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => promoteToVip(profile.id)}
                         className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                       >
                         VIP
                       </Button>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => promoteToAdmin(profile.id)}
                         className="bg-red-500/20 text-red-600 hover:bg-red-500/30"
                       >
                         Admin
                       </Button>
                     </>
                   )}

                   {profile.role === 'vip' && (
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => promoteToAdmin(profile.id)}
                       className="bg-red-500/20 text-red-600 hover:bg-red-500/30"
                     >
                       Admin
                     </Button>
                   )}

                   {profile.role !== 'admin' && (
                     <>
                       <Button
                         size="sm"
                         variant={profile.is_banned ? "outline" : "destructive"}
                         onClick={() => profile.is_banned ? banUser(profile.id, false) : banUserWithDuration(profile.id, 7)}
                       >
                         {profile.is_banned ? "Entbannen" : "7T Ban"}
                       </Button>
                       <Button
                         size="sm"
                         variant="destructive"
                         onClick={() => banUserWithDuration(profile.id, 0)}
                       >
                         Perm Ban
                       </Button>
                     </>
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