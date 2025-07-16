-- Add user roles for admin system
CREATE TYPE user_role AS ENUM ('admin', 'vip', 'user');

-- Add columns to profiles table for roles and gold
ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN gold integer DEFAULT 100;
ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;

-- Add admin management functions
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'admin'
  );
$$;

-- Set specific user as admin
UPDATE profiles SET role = 'admin' WHERE email = 'rezzylesh@gmail.com';

-- Add lobby settings
ALTER TABLE lobbies ADD COLUMN is_private boolean DEFAULT false;
ALTER TABLE lobbies ADD COLUMN max_players_setting integer DEFAULT 8;

-- Add shop purchase tracking
ALTER TABLE user_purchases ADD COLUMN purchase_type text;
ALTER TABLE user_purchases ADD COLUMN is_active boolean DEFAULT true;