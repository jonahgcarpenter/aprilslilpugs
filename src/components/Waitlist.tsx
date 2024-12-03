import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../secrets/firebase';

const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pref_color: '',
    pref_sec: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) 
      return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3,6)}-${phoneNumber.slice(6,10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only update if length is within limits (12 chars: XXX-XXX-XXXX)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'waitlist'), {
        ...formData,
        'joined-timestamp': new Date().toISOString(),
      });
      setSubmitStatus('Success! You have been added to the waitlist.');
      setFormData({ name: '', phone: '', pref_color: '', pref_sec: '' });
    } catch (error) {
      setSubmitStatus('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="waitlist-wrapper">
      {!isExpanded ? (
        <button 
          className="action-button expand-button" 
          onClick={() => setIsExpanded(true)}
        >
          Join our Waitlist
        </button>
      ) : (
        <form className="form-container form-expanded" onSubmit={handleSubmit}>
          <button 
            type="button"
            className="close-button"
            onClick={() => setIsExpanded(false)}
          >
            ×
          </button>
          <h2 className="section-title">Join our Waitlist</h2>
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
              name="pref_color"
              value={formData.pref_color}
              onChange={handleChange}
              required
            >
              <option value="">Prefered Color</option>
              <option value="black">Black</option>
              <option value="apricot">Apricot</option>
              <option value="fawn">Fawn</option>
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-select"
              name="pref_sec"
              value={formData.pref_sec}
              onChange={handleChange}
              required
            >
              <option value="">Prefered Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
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
        </form>
      )}
    </div>
  );
};

export default Waitlist;
