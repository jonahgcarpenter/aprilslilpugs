import { createContext, useReducer } from 'react';

export const DogContext = createContext();

const initialState = {
  grownDogs: [],
  litters: [],
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
    case 'ADD_GROWN_DOG':
      return {
        ...state,
        grownDogs: [action.payload, ...state.grownDogs]
      };
    case 'SET_LITTERS':
      return {
        ...state,
        litters: action.payload,
        loading: false
      };
    case 'ADD_PUPPY':
      return {
        ...state,
        litters: state.litters.map(litter => {
          if (litter._id.mother === action.payload.mother &&
              litter._id.father === action.payload.father &&
              litter._id.birthDate === action.payload.birthDate) {
            return {
              ...litter,
              puppies: [...litter.puppies, action.payload]
            };
          }
          return litter;
        })
      };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_DOG':
      return {
        ...state,
        grownDogs: state.grownDogs.map(dog => 
          dog._id === action.payload._id ? action.payload : dog
        ),
        currentDog: action.payload,
        loading: false
      };
    case 'SET_DOG':
      return { ...state, currentDog: action.payload, loading: false };
    case 'DELETE_DOG':
      return {
        ...state,
        grownDogs: state.grownDogs.filter(dog => dog._id !== action.payload),
        currentDog: null,
        loading: false
      };
    case 'UPDATE_PUPPY':
      return {
        ...state,
        litters: state.litters.map(litter => ({
          ...litter,
          puppies: litter.puppies.map(puppy =>
            puppy._id === action.payload._id ? action.payload : puppy
          )
        }))
      };
    case 'DELETE_PUPPY':
      return {
        ...state,
        litters: state.litters.map(litter => ({
          ...litter,
          puppies: litter.puppies.filter(puppy => puppy._id !== action.payload)
        }))
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

  return (
    <DogContext.Provider value={{...state, dispatch, fetchDogs}}>
      {children}
    </DogContext.Provider>
  );
};
