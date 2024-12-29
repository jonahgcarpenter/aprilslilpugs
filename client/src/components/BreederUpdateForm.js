import { useState, useEffect } from "react"

const BreederUpdateForm = () => {
  const [firstName, setFirstName] = useState('April')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState(null)
  const [breederId, setBreederId] = useState(null)

  useEffect(() => {
    const fetchAprilBreeder = async () => {
      const response = await fetch('/api/breeders')
      const json = await response.json()
      
      if(response.ok) {
        const april = json.find(b => b.firstName.toLowerCase() === 'april')
        if(april) {
          setBreederId(april._id)
          setFirstName(april.firstName)
          setLastName(april.lastName)
        }
      }
    }
    
    fetchAprilBreeder()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!breederId) return

    const breeder = { firstName, lastName }

    const response = await fetch('/api/breeders/' + breederId, {
      method: 'PATCH',
      body: JSON.stringify(breeder),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.message)
    }
    if (response.ok) {
      setError(null)
      console.log('Breeder updated successfully', json)
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