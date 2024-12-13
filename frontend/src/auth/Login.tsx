import { useState, FormEvent, useRef, useEffect } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // First, check if the backend is running
      try {
        await fetch('http://localhost:5000/api/health')
      } catch (e) {
        throw new Error('Unable to connect to server. Is it running on port 5000?');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      // Log full response details for debugging
      console.log('Full response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (response.status === 404) {
        throw new Error('API endpoint not found. Check server configuration.');
      }

      console.log('Response headers:', [...response.headers.entries()]);
      console.log('Response status:', response.status);
      
      if (response.headers.get('content-length') === '0') {
        throw new Error('Empty response from server');
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response body');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data?.error || 'Server error');
      }

      setIsOpen(false);
      window.location.reload(); // Refresh to update auth state
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        Login
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
