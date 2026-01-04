import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <title>Admin Login | April's Lil Pugs</title>
      <meta name="robots" content="noindex, nofollow" />

      <div className="w-full max-w-2xl rounded-2xl bg-slate-900/80 p-12 shadow-2xl backdrop-blur-sm">
        <h2 className="text-3xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-200 p-3 text-center text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 ml-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 ml-1">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer flex items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 text-slate-400 transition-colors hover:border-blue-500 hover:text-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </form>
      </div>
      <div className="w-full max-w-2xl rounded-xl border border-slate-800/50 bg-slate-900/80 p-6 shadow-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          Are you a page admin?
        </h3>
        <p className="mt-2 text-base text-slate-300">
          This login is restricted to administrators updating page content. If
          you are a visitor, please feel free to{" "}
          <Link
            to="/"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            return to the home page
          </Link>{" "}
          and explore.
        </p>
      </div>
    </div>
  );
};

export default Login;
