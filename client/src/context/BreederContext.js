import { createContext, useReducer } from 'react';

export const BreederContext = createContext();

const initialState = {
  breeder: null,
  loading: false,
  error: null
};

export const breederReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BREEDER':
      return {
        ...state,
        breeder: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PROFILE_PICTURE':
      return {
        ...state,
        breeder: {
          ...state.breeder,
          profilePicture: action.payload
        },
        loading: false
      };
    default:
      return state;
  }
};

export const BreederContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(breederReducer, initialState);

  const fetchBreeder = async (breederId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/breeders/${breederId}`);
      if (!response.ok) throw Error('Failed to fetch breeder info');
      const json = await response.json();
      dispatch({ type: 'SET_BREEDER', payload: json });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateProfilePicture = async (breederId, formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/breeders/${breederId}`, {
        method: 'PATCH',
        body: formData
      });
      if (!response.ok) throw Error('Failed to update profile picture');
      const json = await response.json();
      dispatch({ type: 'UPDATE_PROFILE_PICTURE', payload: json.profilePicture });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <BreederContext.Provider value={{
      ...state,
      dispatch,
      fetchBreeder,
      updateProfilePicture
    }}>
      {children}
    </BreederContext.Provider>
  );
};
