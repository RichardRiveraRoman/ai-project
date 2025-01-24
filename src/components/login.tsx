import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOAuth from '../hooks/useOauth';
import { Link } from 'react-router-dom';
import globeImage from '../assets/globe.jpg'

const LoginPage = () => {
    // Local state to hold user input
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    // Error handling state
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);
    // Programmatic navigation from React Router v6
    const navigate = useNavigate();
    
    const { isLoading: isOAuthLoading, githubToken } = useOAuth();
  
    useEffect(() => {
        if (githubToken) {
          console.log('GitHub token detected, navigating to dashboard...');
          navigate('/dashboard');
        }
      }, [githubToken, navigate]); 

    const handleOAuthLogin = () => {
    console.log('navigate to chat')
      window.location.assign(
        'https://github.com/login/oauth/authorize?client_id=' +
          import.meta.env.VITE_CLIENT_ID,
      );
    };
  
    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // Prevent page refresh
      setSubmitting(true);
  
      try {
        const response = await fetch('http://localhost:3000/api/user/login', {
          method: 'POST',
          credentials: 'include', // This is important to allow receiving the httpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }), // pass email/password from state
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          // data.error comes from your backend or a default message
          throw new Error(data.error || 'Failed to login');
        }
  
        // If successful, data.user is returned
        console.log('Login success, user data: ', data.user);
  
        // Optionally store user data in your global state / Redux / Context
        // But your token is already set via httpOnly cookie in the browser
  
        // Navigate to (or whichever route is your "dashboard")
        navigate('/dashboard');
      } catch (err: unknown) {
        console.error('Login error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setSubmitting(false);
      };
    };

    return (
      <div className="bg-blue-200 min-h-screen flex flex-col items-center justify-center">
        {isOAuthLoading || isSubmitting ? (
          <div className="text-lg font-semibold">Loading...</div>
        ) : (
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
            {githubToken ? (
              <div className="text-center text-green-500 font-bold">
                GitHub login successful!
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-center mb-6">Travel Assist</h1>
                <div className="flex flex-col items-center mb-6">
                  
                <img
                  src={globeImage}
                  alt="Logo"
                  className="w-30 h-30 rounded-full object-contain mb-6"
                />
              </div>
  
                <button
                  onClick={handleOAuthLogin}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition mb-4"
                >
                  Sign in with GitHub
                </button>
  
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Sign in
                  </button>
                </form>
  
                <div className="mt-4 text-center">
                  <p className="text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
          </div>
        )}
      </div>
    );
  };
  
  export default LoginPage;