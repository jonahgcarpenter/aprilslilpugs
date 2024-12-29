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
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8 text-center">
            Meet The Breeder
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Personal Info */}
            <div className="flex-1 flex flex-col items-center bg-slate-800/50 rounded-xl p-6">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 text-center">
                {breeder.firstName} {breeder.lastName}
              </h2>
              
              {breeder.profilePicture && (
                <img 
                  src={breeder.profilePicture} 
                  alt={`${breeder.firstName} {breeder.lastName}`}
                  className="w-96 h-96 rounded-xl object-cover border-4 border-slate-700 shadow-lg mb-8"
                />
              )}
              
              <div className="flex justify-center gap-4 w-full overflow-x-auto py-2">
                {breeder.location && (
                  <div className="flex flex-col items-center justify-center bg-slate-800 rounded-xl p-4 w-[120px] h-[90px]">
                    <span className="text-2xl mb-1">🗺️</span>
                    <p className="text-white/95 text-sm text-center truncate w-full">{breeder.location}</p>
                  </div>
                )}
                {breeder.email && (
                  <div className="flex flex-col items-center justify-center bg-slate-800 rounded-xl p-4 w-[120px] h-[90px]">
                    <a href={`mailto:${breeder.email}`} className="text-4xl hover:text-blue-400 transition-all" title={breeder.email}>
                      ✉
                    </a>
                  </div>
                )}
                {breeder.phoneNumber && (
                  <div className="flex flex-col items-center justify-center bg-slate-800 rounded-xl p-4 w-[120px] h-[90px]">
                    <a href={`tel:${breeder.phoneNumber}`} className="text-4xl hover:text-blue-400 transition-all" title={breeder.phoneNumber}>
                      ☎
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Story */}
            {breeder.story && (
              <div className="flex-1 p-6 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">My Story</h2>
                <p className="text-white/90 whitespace-pre-line leading-relaxed text-base">{breeder.story}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default BreederDetails