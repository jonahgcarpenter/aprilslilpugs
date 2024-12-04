import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../secrets/firebase';
import '../styles/waitlist.css';

const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pref_color: '',
    pref_sec: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [checkData, setCheckData] = useState({
    phone: ''
  });
  const [position, setPosition] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) 
      return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3,6)}-${phoneNumber.slice(6,10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (value.length <= 12) {
        setFormData({
          ...formData,
          [name]: formatPhoneNumber(value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = (data: typeof formData) => {
    return data.name && data.phone && data.pref_sec; // Only require name, phone, and gender
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) {
      setSubmitStatus('Please fill out your name, phone, and gender preference.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const collectionName = `waitlist_${formData.pref_sec}`;
      
      // Check if combination already exists
      const existingQuery = query(
        collection(db, collectionName),
        where('phone', '==', formData.phone),
        where('color_preference', '==', formData.pref_color || 'any')
      );
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        setSubmitStatus(`You are already on the waitlist for ${formData.pref_color || 'any'} ${formData.pref_sec}.`);
        setIsSubmitting(false);
        return;
      }

      // Add to waitlist
      await addDoc(collection(db, collectionName), {
        name: formData.name,
        phone: formData.phone,
        color_preference: formData.pref_color || 'any',
        timestamp: new Date().toISOString(),
      });

      setSubmitStatus('Success! You have been added to the waitlist.');
      setFormData({ name: '', phone: '', pref_color: '', pref_sec: '' });
    } catch (error) {
      setSubmitStatus('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPosition(null);

    try {
      const positions: { male: string[], female: string[] } = {
        male: [],
        female: []
      };
      const collections = ['waitlist_male', 'waitlist_female'];

      for (const collectionName of collections) {
        const gender = collectionName.split('_')[1];
        
        // Get all entries ordered by timestamp
        const allEntriesQuery = query(
          collection(db, collectionName),
          orderBy('timestamp', 'asc')
        );
        
        const allEntries = await getDocs(allEntriesQuery);
        const userEntries = allEntries.docs.filter(doc => 
          doc.data().phone === checkData.phone
        );
        
        userEntries.forEach(doc => {
          const userData = doc.data();
          const position = allEntries.docs.findIndex(d => d.id === doc.id) + 1;
          
          const positionText = userData.color_preference !== 'any'
            ? `#${position} (${userData.color_preference})`
            : `#${position} (any color)`;
          
          positions[gender as 'male' | 'female'].push(positionText);
        });
      }

      if (positions.male.length === 0 && positions.female.length === 0) {
        setPosition('No registrations found for this phone number.');
      } else {
        const output = [];
        if (positions.male.length > 0) {
          output.push('Male Waitlist:', ...positions.male.map(p => `  ${p}`));
        }
        if (positions.female.length > 0) {
          if (output.length > 0) output.push(''); // Add spacing between sections
          output.push('Female Waitlist:', ...positions.female.map(p => `  ${p}`));
        }
        setPosition(output.join('\n'));
      }
    } catch (error) {
      console.error('Position checking error:', error);
      setPosition('Error checking positions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="live-section">
      <h2 className="content-subtitle">Waitlist Management</h2>
      <p className="live-description">
        Join our waitlist for upcoming litters or check your current position below.
      </p>
      <section className="waitlist-forms">
        <form className="form-container" onSubmit={handleSubmit}>
          <h3 className="form-title">Join our Waitlist</h3>
          <div className="form-content">
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <input
                className="form-input"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                maxLength={12}
                required
              />
            </div>
            <div className="form-group">
              <select
                className="form-select"
                name="pref_sec"
                value={formData.pref_sec}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender (Required)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <select
                className="form-select"
                name="pref_color"
                value={formData.pref_color}
                onChange={handleChange}
              >
                <option value="">Any Color</option>
                <option value="black">Black</option>
                <option value="apricot">Apricot</option>
                <option value="fawn">Fawn</option>
              </select>
            </div>
            <div className="form-note">
              * Gender selection is required, color preference is optional
            </div>
            <button
              className="action-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
            </button>
            {submitStatus && (
              <p className={submitStatus.includes('Success') ? 'success-message' : 'error-message'}>
                {submitStatus}
              </p>
            )}
          </div>
        </form>

        <form className="form-container" onSubmit={handleCheckPosition}>
          <h3 className="form-title">Check Your Position on the Waitlist</h3>
          <div className="form-content">
            <div className="form-group">
              <input
                className="form-input"
                type="tel"
                name="phone"
                value={checkData.phone}
                onChange={(e) => setCheckData({
                  ...checkData,
                  phone: formatPhoneNumber(e.target.value)
                })}
                placeholder="Phone Number"
                maxLength={12}
                required
              />
            </div>
            <button
              className="action-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Checking...' : 'Check Positions'}
            </button>
            {position && (
              <div className="position-message">
                {position.split('\n').map((pos, index) => (
                  <p key={index}>{pos}</p>
                ))}
              </div>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

export default Waitlist;
