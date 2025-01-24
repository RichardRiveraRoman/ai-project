// import { Container } from 'postcss';
import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  //create state for form inputs
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  //create state for form errors
  const [error, setError] = useState<string | null>(null);

  //use React Router's navigate function to redirect user
  const navigate = useNavigate();

  //google oauth?

  const handleFormSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    //prevent page from refreshing
    e.preventDefault();

    //reset any previous errors
    setError(null);

    // //create new user object
    const newUser = {
      username,
      email,
      password,
    };

    //send new user object to backend
    try {
      const response = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        //redirect user to login page
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-md'>
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold'>Sign Up</h2>
        </div>
        <hr className='mb-4' />
        <div className='mb-4 text-center text-gray-500'>or</div>

        <form onSubmit={handleFormSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'
            >
              Username
            </label>
            <input
              id='username'
              type='text'
              placeholder='Enter username'
              required={true}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='Enter email'
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='Enter password'
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <button
            type='submit'
            className='w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600'
          >
            Sign up
          </button>
        </form>

        {error && (
          <div className='mt-4 rounded bg-red-100 p-3 text-sm text-red-600'>
            {error}
          </div>
        )}

        <div className='mt-4 text-center'>
          <p className='text-sm'>
            Already have an account?{' '}
            <Link to='/login' className='text-blue-500 hover:underline'>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
