import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
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
  const [checkData, setCheckData] = useState({
    phone: '',
    checkColor: '',
    checkSex: '',
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
    return data.name && data.phone && (data.pref_color || data.pref_sec);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) {
      setSubmitStatus('Please fill out your name, phone, and at least one preference.');
      return;
    }
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

  const handleCheckPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPosition(null);

    try {
      let q = query(
        collection(db, 'waitlist'),
        where('phone', '==', checkData.phone)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setPosition('No registration found for this phone number.');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userTimestamp = new Date(userData['joined-timestamp']);

      const conditions = [];
      if (checkData.checkColor) {
        conditions.push(where('pref_color', '==', checkData.checkColor));
      }
      if (checkData.checkSex) {
        conditions.push(where('pref_sec', '==', checkData.checkSex));
      }

      const aheadQuery = query(
        collection(db, 'waitlist'),
        ...conditions,
        where('joined-timestamp', '<', userData['joined-timestamp'])
      );

      const aheadSnapshot = await getDocs(aheadQuery);
      const position = aheadSnapshot.size + 1;

      let positionText = `You are #${position} in line`;
      if (checkData.checkColor && checkData.checkSex) {
        positionText += ` for ${checkData.checkColor} ${checkData.checkSex} puppies`;
      } else if (checkData.checkColor) {
        positionText += ` for ${checkData.checkColor} puppies`;
      } else if (checkData.checkSex) {
        positionText += ` for ${checkData.checkSex} puppies`;
      }
      positionText += '.';
      
      setPosition(positionText);
    } catch (error) {
      setPosition('Error checking position. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="waitlist-forms">
      <form className="form-container" onSubmit={handleSubmit}>
        <h3 className="form-title">Join our Waitlist</h3>
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
        <div className="form-note">
          * At least one preference (color or sex) is required
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

      <form className="form-container position-check" onSubmit={handleCheckPosition}>
        <h3 className="form-title">Check Your Position on the Waitlist</h3>
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
        <div className="form-group">
          <select
            className="form-select"
            value={checkData.checkColor}
            onChange={(e) => setCheckData({
              ...checkData,
              checkColor: e.target.value
            })}
          >
            <option value="">Any Color</option>
            <option value="black">Black</option>
            <option value="apricot">Apricot</option>
            <option value="fawn">Fawn</option>
          </select>
        </div>
        <div className="form-group">
          <select
            className="form-select"
            value={checkData.checkSex}
            onChange={(e) => setCheckData({
              ...checkData,
              checkSex: e.target.value
            })}
          >
            <option value="">Any Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button
          className="action-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Checking...' : 'Check Position'}
        </button>
        {position && (
          <p className="position-message">
            {position}
          </p>
        )}
      </form>
    </div>
  );
};

export default Waitlist;
