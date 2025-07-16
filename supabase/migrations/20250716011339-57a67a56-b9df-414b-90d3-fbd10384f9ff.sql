-- Create lobbies table
CREATE TABLE public.lobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  host_id UUID,
  game_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  max_players INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lobby_players table
CREATE TABLE public.lobby_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;

-- Create policies for lobbies (public access for multiplayer)
CREATE POLICY "Anyone can view lobbies" 
ON public.lobbies 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create lobbies" 
ON public.lobbies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update lobbies" 
ON public.lobbies 
FOR UPDATE 
USING (true);

-- Create policies for lobby_players (public access for multiplayer)
CREATE POLICY "Anyone can view lobby players" 
ON public.lobby_players 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can join lobbies" 
ON public.lobby_players 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update lobby players" 
ON public.lobby_players 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can leave lobbies" 
ON public.lobby_players 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lobbies_updated_at
  BEFORE UPDATE ON public.lobbies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER TABLE public.lobbies REPLICA IDENTITY FULL;
ALTER TABLE public.lobby_players REPLICA IDENTITY FULL;