import { useState, useEffect } from "react"
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
      dispatch({ type: 'UPDATE_BREEDER', payload: json })
    }
  }

  return (
    <form className="max-w-2xl mx-auto mb-8 bg-red-500 rounded-lg shadow-md p-8" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-white mb-6">Update Breeder Profile</h1>
      <div className="space-y-4">
        <input 
          type="text"
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none"
          placeholder="First Name"
        />
        <input 
          type="text"
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none"
          placeholder="Last Name"
        />
        <input 
          type="tel"
          onChange={(e) => setPhoneNumber(e.target.value)}
          value={phoneNumber}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none"
          placeholder="Phone Number"
        />
        <input 
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none"
          placeholder="Email"
        />
        <input 
          type="text"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none"
          placeholder="Location"
        />
        <textarea
          onChange={(e) => setStory(e.target.value)}
          value={story}
          className="w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 outline-none min-h-[100px]"
          placeholder="Your Story"
        />
        <div className="bg-white p-3 rounded-md">
          <input
            type="file"
            onChange={(e) => setProfilePicture(e.target.files[0])}
            className="text-red-500"
            accept="image/*"
          />
        </div>
      </div>
      <button className="mt-6 bg-white text-red-500 px-6 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 font-semibold">Update</button>
      {error && <div className="text-white mt-4 p-3 bg-red-600 rounded-md">{error}</div>}
    </form>
  )
}

export default BreederUpdateForm