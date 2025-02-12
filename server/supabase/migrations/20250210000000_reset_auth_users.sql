-- This migration will reset the auth.users table and restart the identity sequence.
TRUNCATE TABLE auth.users RESTART IDENTITY CASCADE;