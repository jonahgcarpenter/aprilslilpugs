import { createContext, useReducer } from 'react';

export const BreederContext = createContext();

export const breederReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BREEDER':
      return { breeder: action.payload }
    case 'UPDATE_BREEDER':
      return { breeder: action.payload }
    default:
      return state
  }
}

export const BreederContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(breederReducer, {
    breeder: null
  });

  return (
    <BreederContext.Provider value={{...state, dispatch}}>
      {children}
    </BreederContext.Provider>
  )
}