import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSuccess } from '../../store/authSlice';
import { authAPI } from '../../services/api';
import PigmyProLogo from '../assets/PigmyPro.png';
import loginImage from '../assets/login_img.png';

const Login = () => {
  const [mobilenumber, setMobilenumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.loginPatsanstha(mobilenumber, password);
      dispatch(
        loginSuccess({
          user: response.data.patsanstha,
          token: response.data.accessToken,
          userType: 'patsanstha',
        })
      );
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-5xl h-auto">

        {/* Left Panel - Form */}
        <div className="flex-1 flex justify-center items-center p-12 lg:p-16">
          <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="text-center mb-14">
              <img
                src={PigmyProLogo}
                alt="Pigmy Pro Logo"
                className="mx-auto w-32 sm:w-36 md:w-40 filter brightness-0 mb-8"
              />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-8">
              
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobilenumber}
                  onChange={(e) => setMobilenumber(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>




        {/* Right Panel - Image */}
        <div className="hidden lg:flex flex-1 relative">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-purple-600/50 via-purple-500/40 to-transparent"></div>
        </div>

      </div>
    </div>
  );
};

export default Login;
