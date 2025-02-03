import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const usePasswordRecovery = () => {
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryActive(true);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return passwordRecoveryActive;
};
