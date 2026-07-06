import api from './api';

/**
 * Resolves or generates a unique session ID, stored in sessionStorage.
 * This identifies the user's active session during their visit.
 */
const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem('gz_session_id');
  if (!sessionId) {
    // Use modern crypto.randomUUID if available, fallback to custom generator
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      sessionId = window.crypto.randomUUID();
    } else {
      sessionId = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15) + 
                  Date.now().toString(36);
    }
    sessionStorage.setItem('gz_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Tracks session details (page views, cart state, checkout inputs) to the backend.
 * Fails silently so it never interrupts the user's browser experience.
 */
export const trackSession = async (updates = {}) => {
  try {
    const sessionId = getOrCreateSessionId();
    let trafficSource = null;

    try {
      const storedSource = sessionStorage.getItem('gz_traffic_source');
      if (storedSource) {
        trafficSource = JSON.parse(storedSource);
      }
    } catch (e) {
      console.warn('Attribution read error:', e);
    }

    const payload = {
      sessionId,
      trafficSource,
      ...updates
    };

    // Send tracking request to backend
    await api.post('/analytics/session', payload);
  } catch (err) {
    console.warn('Session tracking error:', err);
  }
};
