import { useState, useEffect } from 'react'

const BreederDetails = () => {
  const [breeder, setBreeder] = useState(null)

  useEffect(() => {
    const fetchAprilBreeder = async () => {
      const response = await fetch('/api/breeders')
      const json = await response.json()

      if (response.ok) {
        const april = json.find(b => b.firstName.toLowerCase() === 'april')
        if (april) {
          setBreeder(april)
        }
      }
    }

    fetchAprilBreeder()
  }, [])

  return (
    <>
      {breeder && (
        <div key={breeder._id} className="bg-red-500 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h1 className="text-2xl font-semibold">{breeder.firstName} {breeder.lastName}</h1>
          <p className="text-lg font-semibold">{breeder.createdAt}</p>
        </div>
      )}
    </>
  )
}

export default BreederDetails