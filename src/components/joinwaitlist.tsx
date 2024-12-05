import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../secrets/firebase';

export const JoinWaitlist = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pref_color: '',
    pref_sec: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');

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
    return data.name && data.phone && data.pref_sec;
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

      setSubmitStatus('Success! You have been added to the waitlist. We will contact you when a puppy with your preferences is available.');
      setFormData({ name: '', phone: '', pref_color: '', pref_sec: '' });
    } catch (error) {
      setSubmitStatus('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="waitlistform-container" onSubmit={handleSubmit}>
      <h3 className="waitlistform-title">Join our Waitlist</h3>
      <div className="waitlistform-content">
        <div className="waitlistform-group">
          <input
            className="waitlistform-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            maxLength={50}
            required
          />
        </div>
        <div className="waitlistform-group">
          <input
            className="waitlistform-input"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            maxLength={12}
            required
          />
        </div>
        <div className="waitlistform-group">
          <select
            className="waitlistform-select"
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
        <div className="waitlistform-group">
          <select
            className="waitlistform-select"
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
        <div className="waitlistform-note">
          * Gender selection is required, color preference is optional
        </div>
        <button
          className="joinwaitlist-button"
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
  );
};
