import { useEffect } from 'react'
import { useBreederContext } from '../hooks/useBreederContext'

const BreederDetails = () => {
  const { breeder, dispatch } = useBreederContext()

  useEffect(() => {
    const fetchAprilBreeder = async () => {
      const response = await fetch('/api/breeders')
      const json = await response.json()

      if (response.ok) {
        const april = json.find(b => b.firstName.toLowerCase() === 'april')
        if (april) {
          dispatch({ type: 'SET_BREEDER', payload: april })
        }
      }
    }

    fetchAprilBreeder()
  }, [dispatch])

  return (
    <>
      {breeder && (
        <div key={breeder._id} className="max-w-2xl mx-auto mt-8 mb-6 bg-red-500 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start gap-6">
            {breeder.profilePicture && (
              <img 
                src={breeder.profilePicture} 
                alt={`${breeder.firstName} ${breeder.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white mb-2">
                {breeder.firstName} {breeder.lastName}
              </h1>
              
              <div className="space-y-2 text-white">
                {breeder.location && (
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">📍 Location:</span> {breeder.location}
                  </p>
                )}
                {breeder.email && (
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">📧 Email:</span> 
                    <a href={`mailto:${breeder.email}`} className="hover:underline">
                      {breeder.email}
                    </a>
                  </p>
                )}
                {breeder.phoneNumber && (
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">📞 Phone:</span> 
                    <a href={`tel:${breeder.phoneNumber}`} className="hover:underline">
                      {breeder.phoneNumber}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {breeder.story && (
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">My Story</h2>
              <p className="text-white/90 whitespace-pre-line">{breeder.story}</p>
            </div>
          )}

          <p className="text-sm text-white/75 mt-4">Member since: {new Date(breeder.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </>
  )
}

export default BreederDetails