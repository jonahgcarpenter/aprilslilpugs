import { useState, useEffect, useRef } from "react"
import { useBreederContext } from '../hooks/useBreederContext'

const BreederUpdateForm = () => {
  const { breeder, dispatch } = useBreederContext()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [story, setStory] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (breeder) {
      setFirstName(breeder.firstName)
      setLastName(breeder.lastName)
      setPhoneNumber(breeder.phoneNumber || '')
      setEmail(breeder.email || '')
      setLocation(breeder.location || '')
      setStory(breeder.story || '')
    }
  }, [breeder])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!breeder?._id) return

    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('phoneNumber', phoneNumber)
    formData.append('email', email)
    formData.append('location', location)
    formData.append('story', story)
    if (profilePicture) {
      formData.append('profilePicture', profilePicture)
    }

    const response = await fetch('/api/breeders/' + breeder._id, {
      method: 'PATCH',
      body: formData
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
    }
    if (response.ok) {
      setError(null)
      setProfilePicture(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      dispatch({ type: 'UPDATE_BREEDER', payload: json })
    }
  }

  return (
    <form className="mx-4 bg-slate-900 rounded-xl shadow-xl p-8" onSubmit={handleSubmit}>
      <div className="max-w-[120ch] mx-auto"> {/* Keep form inputs at readable width */}
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Update Breeder Profile
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="First Name"
          />
          <input 
            type="text"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="Last Name"
          />
          <input 
            type="tel"
            onChange={(e) => setPhoneNumber(e.target.value)}
            value={phoneNumber}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="Phone Number"
          />
          <input 
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="Email"
          />
          <input 
            type="text"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 md:col-span-2"
            placeholder="Location"
          />
          <textarea
            onChange={(e) => setStory(e.target.value)}
            value={story}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 min-h-[150px] md:col-span-2"
            placeholder="Your Story"
          />
          <div className="bg-slate-800 p-4 rounded-lg md:col-span-2 border border-slate-700">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="text-white w-full"
              accept="image/*"
            />
          </div>
        </div>
        <button className="mt-8 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white text-base px-8 py-3 rounded-lg transition-all duration-200 font-bold shadow-lg hover:shadow-xl">
          Update Profile
        </button>
        {error && <div className="text-white text-base mt-6 p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">{error}</div>}
      </div>
    </form>
  )
}

export default BreederUpdateForm