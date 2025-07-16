-- Create game_state table to track real-time game state
CREATE TABLE public.game_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  current_player_id TEXT NOT NULL,
  game_phase TEXT NOT NULL DEFAULT 'waiting',
  round_number INTEGER NOT NULL DEFAULT 1,
  last_dice_roll JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_players table to track player state
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  money INTEGER NOT NULL DEFAULT 1500,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  properties TEXT[] NOT NULL DEFAULT '{}',
  in_jail BOOLEAN NOT NULL DEFAULT false,
  jail_turns INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view game state" ON public.game_state FOR SELECT USING (true);
CREATE POLICY "Anyone can update game state" ON public.game_state FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert game state" ON public.game_state FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view game players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Anyone can update game players" ON public.game_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert game players" ON public.game_players FOR INSERT WITH CHECK (true);

-- Add update triggers
CREATE TRIGGER update_game_state_updated_at
BEFORE UPDATE ON public.game_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_players_updated_at
BEFORE UPDATE ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.game_state REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;