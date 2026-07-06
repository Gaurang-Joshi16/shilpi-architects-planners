CREATE OR REPLACE FUNCTION get_admin_count()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT count(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
