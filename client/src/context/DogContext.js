import { createContext, useReducer } from 'react';

export const DogContext = createContext();

const initialState = {
  grownDogs: [],
  puppies: [],
  currentDog: null,
  loading: false,
  error: null
};

export const dogReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GROWN_DOGS':
      return {
        ...state,
        grownDogs: action.payload,
        loading: false
      };
    case 'SET_PUPPIES':
      return {
        ...state,
        puppies: action.payload,
        loading: false
      };
    case 'ADD_GROWN_DOG':
      return {
        ...state,
        grownDogs: [action.payload, ...state.grownDogs]
      };
    case 'ADD_PUPPY':
      return {
        ...state,
        puppies: [...state.puppies, action.payload]
      };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_DOG':
      return { ...state, currentDog: action.payload, loading: false };
    case 'UPDATE_DOG':
      return {
        ...state,
        grownDogs: state.grownDogs.map(dog => 
          dog._id === action.payload._id ? { ...dog, ...action.payload } : dog
        ),
        currentDog: state.currentDog?._id === action.payload._id ? 
          { ...state.currentDog, ...action.payload } : state.currentDog,
        loading: false
      };
    case 'UPDATE_PUPPY':
      return {
        ...state,
        puppies: state.puppies.map(puppy =>
          puppy._id === action.payload._id ? { ...puppy, ...action.payload } : puppy
        )
      };
    case 'DELETE_DOG':
      return {
        ...state,
        grownDogs: state.grownDogs.filter(dog => dog._id !== action.payload),
        currentDog: state.currentDog?._id === action.payload ? null : state.currentDog,
        loading: false
      };
    case 'DELETE_PUPPY':
      return {
        ...state,
        puppies: state.puppies.filter(puppy => puppy._id !== action.payload)
      };
    case 'ADD_DOG_IMAGES':
      return {
        ...state,
        currentDog: {
          ...state.currentDog,
          images: [...(state.currentDog?.images || []), ...action.payload]
        }
      };
    case 'SET_PROFILE_IMAGE':
      return {
        ...state,
        currentDog: {
          ...state.currentDog,
          profileImage: action.payload
        }
      };
    case 'DELETE_DOG_IMAGE':
      return {
        ...state,
        currentDog: {
          ...state.currentDog,
          images: state.currentDog.images.filter(img => img._id !== action.payload)
        }
      };
    default:
      return state;
  }
};

export const DogContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dogReducer, initialState);

  const fetchDogs = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch('/api/dogs/grown');
      if (!response.ok) throw Error('Failed to fetch dogs');
      const json = await response.json();
      dispatch({ type: 'SET_GROWN_DOGS', payload: json });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const uploadDogImages = async (dogId, type, formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/dogs/${type}/${dogId}/images`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw Error('Failed to upload images');
      const json = await response.json();
      dispatch({ type: 'ADD_DOG_IMAGES', payload: json.images });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const setProfileImage = async (dogId, type, imageId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/dogs/${type}/${dogId}/images/${imageId}/profile`, {
        method: 'PUT'
      });
      if (!response.ok) throw Error('Failed to set profile image');
      const json = await response.json();
      dispatch({ type: 'SET_PROFILE_IMAGE', payload: json.profileImage });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteDogImage = async (dogId, type, imageId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await fetch(`/api/dogs/${type}/${dogId}/images/${imageId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw Error('Failed to delete image');
      dispatch({ type: 'DELETE_DOG_IMAGE', payload: imageId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <DogContext.Provider value={{
      ...state,
      dispatch,
      fetchDogs,
      uploadDogImages,
      setProfileImage,
      deleteDogImage
    }}>
      {children}
    </DogContext.Provider>
  );
};
