import { createContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

export const WaitlistContext = createContext();

export const waitlistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ENTRIES':
      return {
        entries: action.payload.sort((a, b) => a.position - b.position),
        isLoading: false,
        error: null
      };
    case 'CREATE_ENTRY':
      return {
        ...state,
        entries: [...state.entries, action.payload].sort((a, b) => a.position - b.position)
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry._id === action.payload._id ? action.payload : entry
        ).sort((a, b) => a.position - b.position)
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(entry => entry._id !== action.payload._id)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const WaitlistProvider = ({ children }) => {
  const { token } = useAuth();
  const { waitlistEnabled } = useSettings();
  const [state, dispatch] = useReducer(waitlistReducer, {
    entries: [],
    error: null
  });

  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  // Add effect to handle waitlist enabled/disabled state
  useEffect(() => {
    if (waitlistEnabled && token) {
      fetchEntries();
    } else {
      dispatch({ type: 'SET_ENTRIES', payload: [] });
    }
  }, [waitlistEnabled, token]);

  const fetchEntries = async () => {
    if (!waitlistEnabled) return;
    
    try {
      const response = await fetch('/api/waitlist', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      dispatch({ type: 'SET_ENTRIES', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createEntry = async (entryData) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      dispatch({ type: 'CREATE_ENTRY', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateEntry = async (id, updates) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      dispatch({ type: 'UPDATE_ENTRY', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      dispatch({ type: 'DELETE_ENTRY', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  return (
    <WaitlistContext.Provider value={{
      ...state,
      fetchEntries,
      createEntry,
      updateEntry,
      deleteEntry,
      isEnabled: waitlistEnabled
    }}>
      {children}
    </WaitlistContext.Provider>
  );
};
