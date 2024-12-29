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
        <div key={breeder._id} className="mx-4 bg-slate-900 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 mt-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {breeder.profilePicture && (
              <img 
                src={breeder.profilePicture} 
                alt={`${breeder.firstName} ${breeder.lastName}`}
                className="w-40 h-40 rounded-xl object-cover border-4 border-slate-700 shadow-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
                {breeder.firstName} {breeder.lastName}
              </h1>
              
              <div className="space-y-2 text-white/95 text-base">
                {breeder.location && (
                  <p className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                    <span className="text-xl">📍</span> {breeder.location}
                  </p>
                )}
                {breeder.email && (
                  <p className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                    <span className="text-xl">📧</span>
                    <a href={`mailto:${breeder.email}`} className="hover:text-blue-400 transition-all">
                      {breeder.email}
                    </a>
                  </p>
                )}
                {breeder.phoneNumber && (
                  <p className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                    <span className="text-xl">📞</span>
                    <a href={`tel:${breeder.phoneNumber}`} className="hover:text-blue-400 transition-all">
                      {breeder.phoneNumber}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {breeder.story && (
            <div className="mt-8 p-6 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-3">My Story</h2>
              <p className="text-white/90 whitespace-pre-line leading-relaxed text-base">{breeder.story}</p>
            </div>
          )}

          <p className="text-sm text-slate-400 mt-6 italic">Member since: {new Date(breeder.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </>
  )
}

export default BreederDetails