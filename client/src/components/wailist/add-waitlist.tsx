import { useState } from "react";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

export interface AddWaitlistInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
}

interface AddWaitlistProps {
  onSubmit: (data: AddWaitlistInput) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  resetError: () => void;
}

const AddWaitlist = ({
  onSubmit,
  isSubmitting,
  error,
  resetError,
}: AddWaitlistProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<AddWaitlistInput>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    preferences: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (error) resetError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call the parent's submit function
    const success = await onSubmit(formData);

    if (success) {
      setIsSuccess(true);
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        preferences: "",
      });
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-2">
              Join the Waitlist
            </h2>
            <p className="text-slate-400">
              Interested in a future puppy? Fill out the form below to get in
              line!
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center flex flex-col items-center animate-fade-in">
              <FaCheckCircle className="text-5xl text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-green-300 mb-2">
                You're on the list!
              </h3>
              <p className="text-green-200/80">
                Thank you for your interest. We have received your information
                and will contact you when a puppy becomes available.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-6 text-sm text-green-400 hover:text-green-300 underline underline-offset-4"
              >
                Add another entry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="firstname"
                    className="text-sm font-medium text-slate-300"
                  >
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    required
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastname"
                    className="text-sm font-medium text-slate-300"
                  >
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    required
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-300"
                  >
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-300"
                  >
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="preferences"
                  className="text-sm font-medium text-slate-300"
                >
                  Puppy Preferences
                </label>
                <textarea
                  id="preferences"
                  name="preferences"
                  rows={4}
                  value={formData.preferences}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  placeholder="Tell us what you're looking for (e.g., gender, color preference)..."
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPaperPlane className="text-sm" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddWaitlist;
