import React, { useState, useContext, useRef, useEffect } from 'react';
import { WaitlistContext } from '../../context/WaitlistContext';
import LoadingAnimation from '../LoadingAnimation';

const Waitlist = () => {
    const { createEntry, entries, isEnabled } = useContext(WaitlistContext);
    const notesRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        notes: '',
        submissionDate: ''
    });
    const [message, setMessage] = useState({ text: '', isError: false });
    const [showInfo, setShowInfo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/\D/g, '');
        let formattedNumber = '';
        if (phoneNumber.length === 0) {
            formattedNumber = '';
        } else if (phoneNumber.length <= 3) {
            formattedNumber = `(${phoneNumber}`;
        } else if (phoneNumber.length <= 6) {
            formattedNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            formattedNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
        return formattedNumber;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            const formatted = formatPhoneNumber(value);
            if (formatted.length <= 14) {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: formatted
                }));
            }
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
            setMessage({ text: 'Please fill in all fields', isError: true });
            return;
        }

        if (!validatePhoneNumber(formData.phoneNumber)) {
            setMessage({ text: 'Please enter a valid phone number', isError: true });
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await createEntry({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                notes: formData.notes,
                status: 'waiting',
                position: (entries?.length || 0) + 1
            });

            setMessage({ 
                text: `Thank you for joining our waitlist! Your position is #${result.position}`, 
                isError: false 
            });
            setFormData({
                firstName: '',
                lastName: '',
                phoneNumber: '',
                notes: '',
                submissionDate: ''
            });
        } catch (error) {
            setMessage({ text: 'Error submitting to waitlist. Please try again.', isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const autoResize = () => {
        const textarea = notesRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleNotesChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, notes: value }));
        autoResize();
    };

    useEffect(() => {
        autoResize();
    }, []);

    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4 mb-8">
                {isEnabled ? 'Join Our Waitlist' : 'Waitlist Currently Closed'}
            </h2>

            {isEnabled ? (
                <>
                    <div className={`transition-all duration-300 ${showInfo ? 'blur-sm' : ''}`}>
                        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-center mb-8 relative">
                                {isEnabled && (
                                    <button
                                        onClick={() => setShowInfo(true)}
                                        className="absolute right-0 text-slate-400 hover:text-blue-400 transition-colors"
                                        aria-label="Show waitlist information"
                                    >
                                        <svg 
                                            className="w-6 h-6" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-slate-300 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-slate-300 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100"
                                            placeholder="Enter your last name"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100"
                                        placeholder="(XXX) XXX-XXXX"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-slate-300 mb-2">
                                        Preferences (optional)
                                    </label>
                                    <textarea
                                        ref={notesRef}
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleNotesChange}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100 overflow-hidden resize-none min-h-[60px]"
                                        placeholder="Enter your color/gender preferences..."
                                    />
                                </div>

                                {message.text && (
                                    <div className={`text-center p-3 rounded-lg ${
                                        message.isError 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : 'bg-green-500/20 text-green-400'
                                    }`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-8 py-3 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 ${
                                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <LoadingAnimation containerClassName="h-6" />
                                        ) : (
                                            'Join Waitlist'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {showInfo && isEnabled && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                            <div 
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setShowInfo(false)}
                            />
                            <div className="relative z-[10000] bg-slate-900 rounded-xl p-6 max-w-lg mx-4 border border-slate-800/50 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-slate-100">
                                        How the Waitlist Works
                                    </h3>
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="text-slate-400 hover:text-slate-200 transition-colors"
                                        aria-label="Close information modal"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-4 text-slate-300">
                                    <p>Our waitlist system helps you secure your spot for upcoming puppy litters. Here's how it works:</p>
                                    <ol className="list-decimal list-inside space-y-2 pl-4">
                                        <li>Fill out the form with your contact information</li>
                                        <li>Your information will be added to our waitlist database</li>
                                        <li>We'll contact you when new puppies become available</li>
                                        <li>Priority is given based on your position in the waitlist and your preferences</li>
                                    </ol>
                                    <p>We'll reach out via phone when puppies become available. Make sure your phone number is correct as this will be our primary method of contact.</p>
                                    <p className="text-slate-400 text-sm">Your information is securely stored and will only be used for waitlist purposes.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-slate-300 text-lg mb-4">
                        We are not currently accepting new waitlist entries.
                    </p>
                    <p className="text-slate-400">
                        Please check back later or follow us on Facebook for updates.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Waitlist;
