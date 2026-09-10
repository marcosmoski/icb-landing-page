import { useEffect, useState } from 'react';

export type CookieConsent = 'all' | 'essential';

const STORAGE_KEY = 'icb-cookie-consent';
const CHANGE_EVENT = 'icb-cookie-consent-change';

const readConsent = (): CookieConsent | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'all' || stored === 'essential' ? stored : null;
  } catch {
    // Navegação privada ou armazenamento bloqueado: tratamos como "ainda não decidiu".
    return null;
  }
};

const broadcast = () => window.dispatchEvent(new Event(CHANGE_EVENT));

export const setCookieConsent = (consent: CookieConsent) => {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
  broadcast();
};

/** Apaga a escolha guardada para o aviso voltar a aparecer. */
export const clearCookieConsent = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a limpar.
  }
  broadcast();
};

/**
 * Estado do consentimento de cookies.
 * `null` significa que a pessoa ainda não escolheu — nesse caso nada de terceiros é carregado.
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(() => readConsent());

  useEffect(() => {
    const sync = () => setConsent(readConsent());

    window.addEventListener(CHANGE_EVENT, sync);
    // Mantém as abas abertas em sintonia.
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    consent,
    hasDecided: consent !== null,
    acceptsExternalContent: consent === 'all',
    accept: () => setCookieConsent('all'),
    reject: () => setCookieConsent('essential'),
    reset: clearCookieConsent,
  };
};
