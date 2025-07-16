import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, LogOut, ShoppingBag, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shop } from "@/components/game/Shop";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { user, signOut } = useAuth();
  const [showShop, setShowShop] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserProfile(data);
      setIsAdmin(data.role === 'admin');
    }
  };

  const getUserDisplayName = () => {
    if (!userProfile) return user?.email || '';
    
    let displayName = userProfile.display_name || user?.email || '';
    
    if (userProfile.role === 'admin') {
      displayName = `(Admin) ${displayName}`;
    } else if (userProfile.role === 'vip') {
      displayName = `(VIP) ${displayName}`;
    }
    
    return displayName;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">FastEstate</CardTitle>
            <p className="text-muted-foreground">Melde dich an, um zu spielen</p>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Anmelden</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-glow">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">FastEstate</h1>
          <p className="text-xl text-white/90 mb-2">Das ultimative Immobilien-Strategiespiel</p>
          <div className="text-white/70">
            Willkommen zurück, 
            <span className={`ml-2 font-semibold ${
              userProfile?.role === 'admin' ? 'text-red-400' : 
              userProfile?.role === 'vip' ? 'text-yellow-400' : 'text-white'
            }`}>
              {getUserDisplayName()}
            </span>
            {userProfile && (
              <div className="text-sm mt-1">
                Gold: {userProfile.gold || 0}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowShop(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setShowAdmin(true)}
                className="bg-red-500/20 border-red-300/50 text-red-100 hover:bg-red-500/30"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={signOut}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6" />
                Neues Spiel
              </CardTitle>
              <p className="text-white/70">Erstelle eine neue Lobby</p>
            </CardHeader>
            <CardContent>
              <Link to="/lobby">
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Lobby erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Spiel beitreten
              </CardTitle>
              <p className="text-white/70">Tritt einer bestehenden Lobby bei</p>
            </CardHeader>
            <CardContent>
              <Link to="/lobby?mode=join">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                  Lobby beitreten
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {showShop && (
        <Shop 
          userGold={userProfile?.gold || 0}
          onPurchase={() => {
            loadUserProfile(); // Reload profile to get updated gold
            setShowShop(false);
          }}
        />
      )}

      {showAdmin && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <Button variant="outline" onClick={() => setShowAdmin(false)}>
                Schließen
              </Button>
            </div>
            <AdminPanel />
          </div>
        </div>
      )}
    </div>
  );
}