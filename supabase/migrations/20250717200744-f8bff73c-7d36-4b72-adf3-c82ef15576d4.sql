-- Add VIP expiration tracking
ALTER TABLE profiles ADD COLUMN vip_expires_at TIMESTAMP WITH TIME ZONE;

-- Add column for purchased avatars/figures
ALTER TABLE profiles ADD COLUMN purchased_avatars TEXT[] DEFAULT '{}';

-- Create shop items for figures
INSERT INTO shop_items (name, description, price, category, available) VALUES
('Ritter', 'Ein edler Ritter in glänzender Rüstung', 50, 'avatar', true),
('Magier', 'Ein mächtiger Zauberer mit Stab', 75, 'avatar', true),
('Dieb', 'Ein geschickter Schurke in dunkler Kleidung', 60, 'avatar', true),
('Prinzessin', 'Eine elegante Prinzessin in königlichem Gewand', 80, 'avatar', true),
('Drache', 'Ein mächtiger Drache (sehr selten)', 200, 'avatar', true),
('VIP Status (30 Tage)', 'VIP Status für 30 Tage mit besonderen Vorteilen', 500, 'premium', true);

-- Create trigger to automatically remove expired VIP status
CREATE OR REPLACE FUNCTION check_vip_expiration()
RETURNS trigger AS $$
BEGIN
  -- Check if VIP has expired
  IF NEW.role = 'vip' AND NEW.vip_expires_at IS NOT NULL AND NEW.vip_expires_at < NOW() THEN
    NEW.role = 'user';
    NEW.vip_expires_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vip_expiration_check
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_vip_expiration();

-- Add ban duration column
ALTER TABLE profiles ADD COLUMN ban_expires_at TIMESTAMP WITH TIME ZONE;