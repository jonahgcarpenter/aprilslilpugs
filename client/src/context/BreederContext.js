import { createContext, useReducer } from 'react';

export const BreederContext = createContext();

export const breederReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BREEDER':
      return {
        ...state,
        breeder: action.payload
      }
    case 'SET_DOGS':
      return {
        ...state,
        dogs: action.payload
      }
    case 'SET_PUPPIES':
      return {
        ...state,
        puppies: action.payload
      }
    default:
      return state;
  }
};

export const BreederContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(breederReducer, {
    breeder: null,
    dogs: null,
    puppies: null
  });

  return (
    <BreederContext.Provider value={{...state, dispatch}}>
      {children}
    </BreederContext.Provider>
  );
};