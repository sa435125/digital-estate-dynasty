-- Create profiles table for user data with language preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create shop_items table for the shop system
CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on shop_items (publicly readable)
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shop items" 
ON public.shop_items 
FOR SELECT 
USING (true);

-- Create user_purchases table to track purchases
CREATE TABLE public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.shop_items(id),
  quantity INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" 
ON public.user_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.user_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default shop items
INSERT INTO public.shop_items (name, description, price, category) VALUES
('Premium Avatar', 'Exklusiver Avatar für dein Profil', 499, 'cosmetic'),
('Goldener Würfel', 'Luxuriöser goldener Würfel', 299, 'cosmetic'),
('Startgeld Boost', '+500 Gold zum Spielstart', 199, 'gameplay'),
('Glücksfeld Bonus', '2x Belohnung auf Glücksfeldern', 399, 'gameplay'),
('VIP Status (30 Tage)', 'Exklusive Vorteile für 30 Tage', 999, 'premium'),
('Doppelte Miete (1 Spiel)', 'Doppelte Mieteinnahmen für ein Spiel', 599, 'gameplay');

-- Update properties table to track ownership properly
ALTER TABLE public.game_players 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add proper property ownership to properties
CREATE TABLE IF NOT EXISTS public.property_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  owner_player_id TEXT,
  houses INTEGER DEFAULT 0,
  is_mortgaged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lobby_id, property_id)
);

-- Enable RLS on property_ownership  
ALTER TABLE public.property_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property ownership" 
ON public.property_ownership 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage property ownership" 
ON public.property_ownership 
FOR ALL 
USING (true);