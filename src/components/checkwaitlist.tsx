import { useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../secrets/firebase';

export const CheckWaitlist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState<string | null>(null);
  const [checkData, setCheckData] = useState({
    phone: ''
  });

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) 
      return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3,6)}-${phoneNumber.slice(6,10)}`;
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
    <form className="checkposition-container" onSubmit={handleCheckPosition}>
      <h3 className="checkposition-title">Check Your Position on the Waitlist</h3>
      <div className="checkposition-content">
        <div className="checkposition-group">
          <input
            className="checkposition-input"
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
          className="checkposition-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Checking...' : 'Check Positions'}
        </button>
        {position && (
          <div className="checkposition-message">
            {position.split('\n').map((pos, index) => (
              <p key={index}>{pos}</p>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};
