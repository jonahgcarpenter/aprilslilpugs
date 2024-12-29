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
  const textareaRef = useRef(null);

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

  // Add auto-resize effect for textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [story]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const truncated = numbers.slice(0, 10)
    
    // Format the number
    if (truncated.length < 4) return truncated
    if (truncated.length < 7) return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`
    return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`
  }

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value)
    setPhoneNumber(formattedNumber)
  }

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
            onChange={handlePhoneChange}
            value={phoneNumber}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="(XXX) XXX-XXXX"
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
            ref={textareaRef}
            onChange={(e) => setStory(e.target.value)}
            value={story}
            className="w-full p-3 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 md:col-span-2 resize-none scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-slate-700 hover:scrollbar-thumb-blue-400 max-h-[300px] overflow-y-auto"
            placeholder="Your Story"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setProfilePicture(e.target.files[0])}
            className="w-full md:col-span-2 text-white text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-600 file:to-blue-400 file:text-white hover:file:from-blue-700 hover:file:to-blue-500 file:transition-all file:duration-200 file:shadow-lg hover:file:shadow-xl"
            accept="image/*"
          />
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