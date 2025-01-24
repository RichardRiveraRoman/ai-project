import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOAuth from '../hooks/useOauth';
import { Link } from 'react-router-dom';

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
    <div>
      {isOAuthLoading || isSubmitting ? (
        <div>Loading...</div>
      ) : (
        <div>
          {githubToken ? (
            <div>GitHub login successful!</div>
          ) : (
            <div>
              <button onClick={handleOAuthLogin}>
                Sign in with Github
              </button>
              <form onSubmit={handleFormSubmit}>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={isSubmitting}>
                  Sign in
                </button>
              </form>
              <div>
                <p>
                  Don&apos;t have an account?{' '}
                  <Link to='/signup'>Sign up here</Link>
                </p>
              </div>
            </div>
          )}
          {error && <div>{error}</div>}
        </div>
      )}
    </div>
  );
};

export default LoginPage;