import { useState, useEffect, useRef } from "react"
import { useBreederContext } from '../hooks/useBreederContext'

const BreederUpdateForm = ({ initialData = null }) => {
  const { breeder, dispatch } = useBreederContext()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [story, setStory] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null)
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
      setCurrentProfilePicture(breeder.profilePicture || null)
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', file); // Must match the field name expected by multer
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('email', email);
      formData.append('location', location);
      formData.append('story', story);

      const response = await fetch(`/api/breeders/${breeder._id}`, {
        method: 'PATCH',
        body: formData // Don't set Content-Type header, let browser set it with boundary
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to update profile picture');
      }

      dispatch({ type: 'UPDATE_BREEDER', payload: json });
      if (json.profilePicture) {
        setCurrentProfilePicture(json.profilePicture);
      }
      setError(null);

    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!breeder?._id) return;

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('email', email);
      formData.append('location', location);
      formData.append('story', story);

      const response = await fetch('/api/breeders/' + breeder._id, {
        method: 'PATCH',
        body: formData
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Update failed');
      }

      setError(null);
      dispatch({ type: 'UPDATE_BREEDER', payload: json });

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8" onSubmit={handleSubmit}>
      <div className="max-w-[120ch] mx-auto"> {/* Keep form inputs at readable width */}
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 sm:mb-8">
          Update Breeder Profile
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <input 
            type="text"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="First Name"
          />
          <input 
            type="text"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="Last Name"
          />
          <input 
            type="tel"
            onChange={handlePhoneChange}
            value={phoneNumber}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="(XXX) XXX-XXXX"
          />
          <input 
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200"
            placeholder="Email"
          />
          <input 
            type="text"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 sm:col-span-2"
            placeholder="Location"
          />
          <textarea
            ref={textareaRef}
            onChange={(e) => setStory(e.target.value)}
            value={story}
            className="w-full p-4 rounded-lg bg-slate-800 text-white text-base border border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 sm:col-span-2 resize-none scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-slate-700 hover:scrollbar-thumb-blue-400 max-h-[300px] overflow-y-auto"
            placeholder="Your Story"
          />
          <div className="form-group sm:col-span-2">
            <label className="block text-lg font-semibold mb-4 text-white">Profile Picture</label>
            <div className="flex flex-col gap-4">
              {currentProfilePicture && (
                <div className="relative w-32 h-32">
                  <img
                    src={`/api/images/uploads/breeder-profiles/${currentProfilePicture.split('/').pop()}`}
                    alt="Current Profile"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
              />
              <p className="text-sm text-slate-400">Upload a new image to replace the current profile picture</p>
            </div>
          </div>
        </div>
        <button className="w-full sm:w-auto mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white text-base px-6 py-3 rounded-lg transition-all duration-200 font-bold shadow-lg hover:shadow-xl">
          Update Profile
        </button>
        {error && <div className="text-white text-sm sm:text-base mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">{error}</div>}
      </div>
    </form>
  )
}

export default BreederUpdateForm