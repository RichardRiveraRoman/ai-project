import { useState } from 'react';

type ParsedResponse = {
  tripAdvice: string;
};

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
        const parsedResponse: ParsedResponse = await response.json();
        setAdvice(parsedResponse.tripAdvice);
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-1'>
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
          <h2>Advise:</h2>
          <p>{advice}</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
