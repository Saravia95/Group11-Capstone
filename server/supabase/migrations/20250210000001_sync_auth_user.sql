-- Function to sync new auth users to public tables
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate required fields in auth user metadata
  IF (
    NEW.raw_user_meta_data ? 'first_name' 
    AND jsonb_typeof(NEW.raw_user_meta_data->'first_name') = 'string'
  ) THEN
    -- Insert base user info to public.users
    INSERT INTO public.users (
      id, 
      email, 
      first_name, 
      last_name, 
      display_name, 
      created_at
    ) VALUES (
      NEW.id, 
      NEW.email, 
      NEW.raw_user_meta_data->>'first_name', 
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'display_name', 
      NEW.created_at
    );

    -- Create default subscription record
    INSERT INTO public.subscriptions (
      id,
      user_id,
      start_date,
      billing_rate,
      membership_status,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status
    ) VALUES (
      gen_random_uuid(),  -- Explicit UUID generation
      NEW.id,
      NOW(),
      0, 
      FALSE,  
      '', 
      '',  
      'inactive'  
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user creation sync
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
CREATE TRIGGER sync_auth_user_to_public
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_public();

-- Function to handle user deletion cascade
CREATE OR REPLACE FUNCTION public.sync_user_deletion()
RETURNS TRIGGER AS $$
BEGIN

  -- Delete dependent records first to maintain referential integrity
  DELETE FROM public.subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.request_songs WHERE owner_id = OLD.id; 
  DELETE FROM public.users WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user deletion sync
DROP TRIGGER IF EXISTS sync_user_deletion ON auth.users;
CREATE TRIGGER sync_user_deletion
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_deletion();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.sync_auth_user_to_public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.sync_user_deletion TO supabase_auth_admin;