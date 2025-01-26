import { createContext, useContext, useState } from 'react';

const WaitlistContext = createContext();

export const WaitlistProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);

  const refreshEntries = async () => {
    const response = await fetch('/api/waitlist');
    const json = await response.json();
    if (response.ok) {
      setEntries(json);
    }
  };

  const updateEntry = async (id, data) => {
    const response = await fetch(`/api/waitlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      refreshEntries();
    }
  };

  const deleteEntry = async (id) => {
    const response = await fetch(`/api/waitlist/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      refreshEntries();
    }
  };

  return (
    <WaitlistContext.Provider value={{ 
      entries, 
      refreshEntries, 
      updateEntry, 
      deleteEntry 
    }}>
      {children}
    </WaitlistContext.Provider>
  );
};

export const useWaitlist = () => useContext(WaitlistContext);
