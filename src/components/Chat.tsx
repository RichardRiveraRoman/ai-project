import { useState } from 'react';

const Chat = () => {
  const [userQuery, setUserQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAdvice('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery }),
      });

      if (response.status !== 200) {
        const parsedError: { err: string } = await response.json();
        setError(parsedError.err);
      } else {
        const { tripAdvice } = await response.json();
        setAdvice(JSON.stringify(tripAdvice, null, 2));
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-2 flex justify-center border-2 border-blue-200 bg-slate-200 p-2 text-center text-2xl'>
      <form onSubmit={handleSubmit}>
        <label>Trip Advisor</label>

        <input
          type='text'
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder='I would like some trip advise for traveling to...'
          className='mt-0.5 w-full p-0.5'
        />

        <button type='submit' className='mt-1' disabled={loading}>
          {loading ? 'Loading...' : 'Get Advice'}
        </button>
      </form>
      {error && <p className='error'>{error}</p>}
      {advice && (
        <div className='mt-1'>
          <h2>Advice:</h2>
          <p>{advice}</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
