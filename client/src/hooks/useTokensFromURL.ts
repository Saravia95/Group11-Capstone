import { useEffect, useState } from 'react';

export const useTokensFromURL = (enabled: boolean) => {
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string }>({
    accessToken: '',
    refreshToken: '',
  });

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token') || '';
    const refreshToken = params.get('refresh_token') || '';

    setTokens({ accessToken, refreshToken });
  }, [enabled]);

  return tokens;
};
