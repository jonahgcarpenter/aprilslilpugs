import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginStatus, clearLoginStatus, setLoginStatus } = useAuth();

  const isFormValid = () => {
    return email.trim() !== '' && password.trim() !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setLoginStatus({
        message: 'Please enter your email',
        type: 'error'
      });
      return;
    }

    if (!password) {
      setLoginStatus({
        message: 'Password is required',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    if (clearLoginStatus) clearLoginStatus();
    
    const result = await login(email, password);
    
    if (result.success) {
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setShowModal(false);
        if (clearLoginStatus) clearLoginStatus();
      }, 1500);
    }
    
    setIsLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEmail('');
    setPassword('');
    clearLoginStatus();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        Login
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
          <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
              Admin Login
            </h2>
            
            {loginStatus.message && (
              <div className={`p-3 rounded-lg mb-4 ${
                loginStatus.type === 'error' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
              }`}>
                {loginStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 rounded-lg bg-slate-700 text-white text-base border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 rounded-lg bg-slate-700 text-white text-base border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none transition-all duration-200 disabled:opacity-50"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginButton;