import { createContext, useReducer, useContext } from 'react';
import { AuthContext } from './AuthContext';

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
    case 'UPDATE_BREEDER_IMAGE':
      return {
        ...state,
        breeder: {
          ...state.breeder,
          images: action.payload
        },
        loading: false
      };
    default:
      return state;
  }
};

export const BreederContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(breederReducer, initialState);
  const { token } = useContext(AuthContext);

  const fetchBreederProfile = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch('/api/breeder/profile');
      if (!response.ok) throw Error('Failed to fetch breeder info');
      const json = await response.json();
      dispatch({ type: 'SET_BREEDER', payload: json });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateBreederProfile = async (formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch('/api/breeder/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw Error('Failed to update profile');
      const json = await response.json();
      dispatch({ type: 'SET_BREEDER', payload: json });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateBreederImage = async (index, formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/breeder/images/${index}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw Error('Failed to update image');
      const json = await response.json();
      dispatch({ type: 'UPDATE_BREEDER_IMAGE', payload: json.images });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <BreederContext.Provider value={{
      ...state,
      dispatch,
      fetchBreederProfile,
      updateBreederProfile,
      updateBreederImage
    }}>
      {children}
    </BreederContext.Provider>
  );
};
