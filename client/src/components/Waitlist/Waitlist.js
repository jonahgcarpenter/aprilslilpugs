import React, { useState, useRef, useEffect } from "react";
import { useWaitlist } from "../../hooks/useWaitlist";
import { useSettings } from "../../hooks/useSettings";
import LoadingAnimation from "../Misc/LoadingAnimation";

const Waitlist = () => {
  const { createEntry, entries } = useWaitlist();
  const { settings } = useSettings();
  const waitlistEnabled = settings?.waitlistEnabled;

  const notesRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    notes: "",
    submissionDate: "",
  });

  const [showInfo, setShowInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");
    let formattedNumber = "";
    if (phoneNumber.length === 0) {
      formattedNumber = "";
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
    if (name === "phoneNumber") {
      const formatted = formatPhoneNumber(value);
      if (formatted.length <= 14) {
        setFormData((prevState) => ({
          ...prevState,
          [name]: formatted,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    if (!waitlistEnabled) {
      setErrorMessage(
        "The waitlist is currently closed. Please try again later.",
      );
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    try {
      setIsSubmitting(true);

      const currentPosition = (entries?.length || 0) + 1;

      const result = await createEntry({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
        status: "waiting",
        position: currentPosition,
      });

      if (!result) {
        throw new Error("Failed to create waitlist entry");
      }

      setSuccessMessage(
        `Congratulations! You've been added to the waitlist at position #${result.position}`,
      );
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        notes: "",
        submissionDate: "",
      });
    } catch (error) {
      setErrorMessage(
        error.message || "Error submitting to waitlist. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoResize = () => {
    const textarea = notesRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleNotesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, notes: value }));
    autoResize();
  };

  useEffect(() => {
    autoResize();
  }, []);

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4 mb-8">
        {waitlistEnabled ? "Join Our Waitlist" : "Waitlist Currently Closed"}
      </h2>

      {waitlistEnabled && (
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full group bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 rounded-lg p-4 flex items-center justify-between"
          >
            <span className="text-slate-300 font-medium">
              How does the waitlist work?
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showInfo ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              showInfo ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 space-y-4 text-slate-300 bg-slate-800/25 rounded-b-lg border-t border-slate-700/50">
              <p className="text-center ">
                Our waitlist system helps you secure your spot for upcoming
                puppy litters.
              </p>
              <ol className="flex flex-col items-center space-y-2">
                <li>Fill out the form with your contact information.</li>
                <li>
                  We'll contact you by phone when new puppies become available.
                </li>
              </ol>
              <p className="text-center font-bold">
                The number you are given only reflects the order you may be
                contacted in. It does not reflect the order in which you might
                receive a puppy due to color/gender preferences.
              </p>
            </div>
          </div>
        </div>
      )}

      {waitlistEnabled ? (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-slate-300 mb-2"
                >
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
              <label
                htmlFor="phoneNumber"
                className="block text-slate-300 mb-2"
              >
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

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <LoadingAnimation containerClassName="h-6" />
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </div>
          </form>
        </div>
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

      {successMessage && (
        <div className="text-center text-green-500 mt-4">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="text-center text-red-500 mt-4">{errorMessage}</div>
      )}
    </div>
  );
};

export default Waitlist;
