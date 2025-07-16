-- Enable realtime for lobby_players table
ALTER TABLE public.lobby_players REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_players;

-- Also enable for lobbies table
ALTER TABLE public.lobbies REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;