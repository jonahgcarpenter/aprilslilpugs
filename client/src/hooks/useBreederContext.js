import { useContext } from 'react'
import { BreederContext } from '../context/BreederContext'

export const useBreederContext = () => {
  const context = useContext(BreederContext)

  if (!context) {
    throw Error('useBreederContext must be used inside a BreederContextProvider')
  }

  return context
}