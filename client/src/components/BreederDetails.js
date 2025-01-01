import { useEffect } from 'react'
import { useBreederContext } from '../hooks/useBreederContext'
import { FaFacebook, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaHeart } from 'react-icons/fa'

const BreederDetails = () => {
  const { breeder, loading, error, fetchBreeder } = useBreederContext()

  useEffect(() => {
    fetchBreeder()
  }, [])

  if (loading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
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
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          {/* Hero Section */}
          <div className="relative mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {breeder.profilePicture && (
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-6 opacity-20"></div>
                  <img 
                    src={`/api/images/uploads/breeder-profiles/${breeder.profilePicture.split('/').pop()}`}
                    alt={`${breeder.firstName} ${breeder.lastName}`}
                    className="relative w-full h-full object-cover rounded-xl border-2 border-white/10 shadow-xl transform transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
                  {breeder.firstName} {breeder.lastName}
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                  <FaHeart className="text-blue-400" />
                  <span className="text-white/90">Passionate Pug Breeder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {breeder.location && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breeder.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
              >
                <FaMapMarkerAlt className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white/80 text-sm text-center">{breeder.location}</span>
              </a>
            )}
            {breeder.email && (
              <a 
                href={`mailto:${breeder.email}`}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
              >
                <FaEnvelope className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white/80 text-sm text-center">Email Me</span>
              </a>
            )}
            {breeder.phoneNumber && (
              <a 
                href={`tel:${breeder.phoneNumber}`}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
              >
                <FaPhoneAlt className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white/80 text-sm text-center">Call Me</span>
              </a>
            )}
            <a 
              href="https://www.facebook.com/AprilsLilPugs/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
            >
              <FaFacebook className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-white/80 text-sm text-center">Facebook</span>
            </a>
          </div>

          {/* Story Section */}
          {breeder.story && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">My Journey with Pugs</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 whitespace-pre-line leading-relaxed text-base">
                  {breeder.story}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default BreederDetails