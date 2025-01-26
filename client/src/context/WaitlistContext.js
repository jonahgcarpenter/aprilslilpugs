import { createContext, useReducer } from 'react';

export const WaitlistContext = createContext();

export const waitlistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ENTRIES':
      return {
        entries: action.payload.sort((a, b) => a.position - b.position)
      };
    case 'CREATE_ENTRY':
      return {
        entries: [...state.entries, action.payload].sort((a, b) => a.position - b.position)
      };
    case 'UPDATE_ENTRY':
      return {
        entries: state.entries.map(entry =>
          entry._id === action.payload._id 
            ? { ...entry, ...action.payload }
            : entry
        ).sort((a, b) => a.position - b.position)
      };
    case 'DELETE_ENTRY':
      return {
        entries: state.entries.filter(entry => entry._id !== action.payload._id)
      };
    default:
      return state;
  }
};

export const WaitlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(waitlistReducer, {
    entries: []
  });

  // Fetch all entries
  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/waitlist');
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_ENTRIES', payload: json });
      }
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
    }
  };

  // Create new entry
  const createEntry = async (entryData) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'CREATE_ENTRY', payload: json });
        return json;
      }
    } catch (error) {
      console.error('Error creating waitlist entry:', error);
      throw error;
    }
  };

  // Update entry
  const updateEntry = async (id, updates) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_ENTRY', payload: json });
        return json;
      }
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      throw error;
    }
  };

  // Delete entry
  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE'
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'DELETE_ENTRY', payload: json });
        return json;
      }
    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      throw error;
    }
  };

  return (
    <WaitlistContext.Provider value={{
      ...state,
      fetchEntries,
      createEntry,
      updateEntry,
      deleteEntry
    }}>
      {children}
    </WaitlistContext.Provider>
  );
};
