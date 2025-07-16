import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Star, Zap, Crown, Gift, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

interface ShopProps {
  userGold?: number;
  onPurchase?: (item: ShopItem) => void;
}

export function Shop({ userGold = 100, onPurchase }: ShopProps) {
  const { toast } = useToast();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('available', true)
        .order('category', { ascending: true })
        .order('price', { ascending: true });

      if (error) throw error;
      setShopItems(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Shop-Items:', error);
      toast({
        title: "Fehler",
        description: "Shop-Items konnten nicht geladen werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePurchase = async (item: ShopItem) => {
    if (userGold < item.price) {
      toast({
        title: "Nicht genug Gold",
        description: "Du hast nicht genug Gold für diesen Kauf.",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(item.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um etwas zu kaufen",
          variant: "destructive",
        });
        return;
      }

      // Deduct gold and record purchase
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold')
        .eq('user_id', user.id)
        .single();

      const newGold = (profile?.gold || 0) - item.price;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gold: newGold })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
          total_price: item.price,
          quantity: 1,
          purchase_type: item.category
        });

      if (error) throw error;

      toast({
        title: "Kauf erfolgreich!",
        description: `Du hast ${item.name} erfolgreich gekauft!`,
      });

      onPurchase?.(item);
    } catch (error: any) {
      toast({
        title: "Kauffehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cosmetic':
        return <Star className="h-4 w-4" />;
      case 'gameplay':
        return <Zap className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cosmetic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'gameplay':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cosmetic':
        return 'Kosmetik';
      case 'gameplay':
        return 'Gameplay';
      case 'premium':
        return 'Premium';
      default:
        return 'Sonstiges';
    }
  };

  const groupedItems = shopItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Lade Shop...</div>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-yellow-400" />
            FastEstate Shop
            <div className="ml-auto flex items-center gap-2 text-yellow-400">
              <Coins className="h-5 w-5" />
              {userGold.toLocaleString()}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <h3 className="text-lg font-semibold text-white">
                  {getCategoryName(category)}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-white text-base">{item.name}</CardTitle>
                        <Badge className={getCategoryColor(category)}>
                          {getCategoryIcon(category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-slate-300 text-sm">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Coins className="h-4 w-4" />
                          {item.price.toLocaleString()}
                        </div>
                        <Button
                          onClick={() => handlePurchase(item)}
                          disabled={purchasing === item.id || userGold < item.price}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
                          size="sm"
                        >
                          {purchasing === item.id ? "Kaufe..." : 
                           userGold < item.price ? "Zu teuer" : "Kaufen"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {shopItems.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Der Shop ist derzeit leer. Komm später wieder!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}