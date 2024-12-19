import { FormEvent, useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      await login(email, password);
      setEmail('');
      setPassword('');
      onSuccess();
    } catch (error) {
      // Error is now handled by the context
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded-md"
            disabled={isLoggingIn}
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
            disabled={isLoggingIn}
          />
        </div>
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {isLoggingIn ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
