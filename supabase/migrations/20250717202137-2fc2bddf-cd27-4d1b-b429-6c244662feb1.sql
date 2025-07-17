-- Create function to get all profiles for admin panel (bypassing RLS)
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  role user_role,
  gold integer,
  is_banned boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  vip_expires_at timestamp with time zone,
  ban_expires_at timestamp with time zone,
  language text,
  purchased_avatars text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id, user_id, email, display_name, role, gold, is_banned, 
    created_at, updated_at, vip_expires_at, ban_expires_at, 
    language, purchased_avatars
  FROM profiles
  ORDER BY created_at DESC;
$$;