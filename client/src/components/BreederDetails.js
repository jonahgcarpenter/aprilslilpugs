import { useEffect } from 'react'
import { useBreederContext } from '../hooks/useBreederContext'
import { FaFacebook, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'

const BreederDetails = () => {
  const { breeder, loading, error, fetchBreeder } = useBreederContext()

  useEffect(() => {
    fetchBreeder()
  }, [])

  if (loading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-white text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      {breeder && (
        <div key={breeder._id} className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 hover:shadow-2xl transition-all duration-300">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 text-center">
            Meet The Breeder
          </h1>
          
          {/* Personal Info Section */}
          <div className="flex-1 flex flex-col items-center bg-slate-800/50 rounded-xl p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4 sm:mb-6 text-center">
              {breeder.firstName} {breeder.lastName}
            </h2>
            
            {breeder.profilePicture && (
              <img 
                src={`/api/images/uploads/breeder-profiles/${breeder.profilePicture.split('/').pop()}`}
                alt={`${breeder.firstName} ${breeder.lastName}`}
                className="w-full max-w-[500px] aspect-square rounded-xl object-cover border-4 border-slate-700 shadow-lg mb-6 sm:mb-8"
              />
            )}
            
            <div className="flex flex-wrap justify-center gap-3 w-full py-2">
              {breeder.location && (
                <div className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 rounded-xl p-3 min-w-[90px] sm:w-[100px] h-[70px] sm:h-[80px] transition-all duration-300 group">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breeder.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group-hover:text-blue-400"
                  >
                    <FaMapMarkerAlt className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300 text-white group-hover:text-blue-400" />
                    <span className="text-white/80 text-xs text-center font-medium">{breeder.location}</span>
                  </a>
                </div>
              )}
              {breeder.email && (
                <div className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 rounded-xl p-3 min-w-[90px] sm:w-[100px] h-[70px] sm:h-[80px] transition-all duration-300 group">
                  <a href={`mailto:${breeder.email}`} className="flex flex-col items-center group-hover:text-blue-400" title={breeder.email}>
                    <FaEnvelope className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300 text-white group-hover:text-blue-400" />
                    <span className="text-white/80 text-xs text-center font-medium">Email</span>
                  </a>
                </div>
              )}
              {breeder.phoneNumber && (
                <div className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 rounded-xl p-3 min-w-[90px] sm:w-[100px] h-[70px] sm:h-[80px] transition-all duration-300 group">
                  <a href={`tel:${breeder.phoneNumber}`} className="flex flex-col items-center group-hover:text-blue-400" title={breeder.phoneNumber}>
                    <FaPhoneAlt className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300 text-white group-hover:text-blue-400" />
                    <span className="text-white/80 text-xs text-center font-medium">Call</span>
                  </a>
                </div>
              )}
              <div className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 rounded-xl p-3 min-w-[90px] sm:w-[100px] h-[70px] sm:h-[80px] transition-all duration-300 group">
                <a 
                  href="https://www.facebook.com/AprilsLilPugs/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex flex-col items-center group-hover:text-blue-400"
                >
                  <FaFacebook className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300 text-white group-hover:text-blue-400" />
                  <span className="text-white/80 text-xs text-center font-medium">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Story Section */}
          {breeder.story && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">My Story</h2>
              <p className="text-white/90 whitespace-pre-line leading-relaxed text-base">{breeder.story}</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default BreederDetails