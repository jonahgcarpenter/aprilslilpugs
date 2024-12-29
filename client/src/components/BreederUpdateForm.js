import { useState, useEffect } from "react"
import { useBreederContext } from '../hooks/useBreederContext'

const BreederUpdateForm = () => {
  const { breeder, dispatch } = useBreederContext()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (breeder) {
      setFirstName(breeder.firstName)
      setLastName(breeder.lastName)
    }
  }, [breeder])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!breeder?._id) return

    const updatedBreeder = { firstName, lastName }

    const response = await fetch('/api/breeders/' + breeder._id, {
      method: 'PATCH',
      body: JSON.stringify(updatedBreeder),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
    }
    if (response.ok) {
      setError(null)
      dispatch({ type: 'UPDATE_BREEDER', payload: json })
    }
  }

  return (
    <form className="bg-red-500 rounded-lg shadow-md p-6" onSubmit={handleSubmit}>
      <h1 className="text-xl font-semibold">Update Breeder</h1>
      <div className="mt-4">
        <input 
          type="text"
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
          className="w-full p-2 rounded"
          placeholder="First Name"
        />
      </div>
      <div className="mt-4">
        <input 
          type="text"
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
          className="w-full p-2 rounded"
          placeholder="Last Name"
        />
      </div>
      <button className="mt-4 bg-white text-red-500 px-4 py-2 rounded">Update</button>
      {error && <div className="text-white mt-4">{error}</div>}
    </form>
  )
}

export default BreederUpdateForm