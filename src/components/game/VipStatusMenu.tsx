import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Clock, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VipStatusMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  role: 'admin' | 'vip' | 'user';
  vip_expires_at?: string;
  purchased_avatars?: string[];
}

export function VipStatusMenu({ isOpen, onClose }: VipStatusMenuProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('👤');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('role, vip_expires_at, purchased_avatars')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const saveAvatarSelection = async (avatar: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSelectedAvatar(avatar);
    toast({
      title: "Avatar gespeichert!",
      description: `Du hast ${avatar} als dein Avatar ausgewählt`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const availableAvatars = [
    '👤', '👑', '🎩', '🧙‍♂️', '🦄', '🐉', '⚔️', '🏰',
    '💎', '🌟', '🔥', '⚡', '🎨', '🎭', '🎪', '🎯'
  ];

  const isVipExpired = profile?.vip_expires_at && new Date(profile.vip_expires_at) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-primary to-primary-glow border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Profil & Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Dein Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {profile?.role === 'admin' && (
                  <Badge className="bg-red-500/80 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Administrator
                  </Badge>
                )}
                {profile?.role === 'vip' && !isVipExpired && (
                  <Badge className="bg-yellow-500/80 text-white">
                    <Star className="w-4 h-4 mr-1" />
                    VIP Member
                  </Badge>
                )}
                {(profile?.role === 'user' || isVipExpired) && (
                  <Badge variant="outline" className="border-white/20 text-white">
                    <User className="w-4 h-4 mr-1" />
                    Basis Member
                  </Badge>
                )}
              </div>

              {profile?.vip_expires_at && !isVipExpired && (
                <div className="mt-3 flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    VIP gültig bis: {formatDate(profile.vip_expires_at)}
                  </span>
                </div>
              )}

              {isVipExpired && (
                <div className="mt-3 text-red-300 text-sm">
                  VIP Status ist abgelaufen
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Deine Figuren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-3">
                {availableAvatars.map((avatar) => {
                  const isOwned = profile?.purchased_avatars?.includes(avatar) || 
                                  avatar === '👤' || 
                                  profile?.role === 'vip' || 
                                  profile?.role === 'admin';
                  
                  return (
                    <Button
                      key={avatar}
                      variant={selectedAvatar === avatar ? "default" : "outline"}
                      className={`h-12 w-12 text-2xl p-0 ${
                        isOwned 
                          ? "bg-white/20 border-white/30 hover:bg-white/30" 
                          : "bg-gray-500/20 border-gray-500/30 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => isOwned && saveAvatarSelection(avatar)}
                      disabled={!isOwned}
                    >
                      {avatar}
                    </Button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-white/70 text-sm">
                {profile?.role === 'admin' && "Als Admin hast du Zugang zu allen Figuren!"}
                {profile?.role === 'vip' && !isVipExpired && "Als VIP hast du Zugang zu allen Figuren!"}
                {(profile?.role === 'user' || isVipExpired) && "Kaufe mehr Figuren im Shop oder werde VIP!"}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}