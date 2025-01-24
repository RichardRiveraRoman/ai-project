import React, { useState } from 'react';
import {
  IPackingItem,
  ILocationDetails,
  ITripDuration,
  IPackingList,
} from '../types/types';

const TravelPlan = () => {
  const [userQuery, setUserQuery] = useState('');
  const [advice, setAdvice] = useState<IPackingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAdvice(null);

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
        setAdvice(tripAdvice);
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-slate-200'>
      <h1 className='text-center text-2xl font-bold'>Travel Planner</h1>
      <div className='mt-2 flex flex-col items-center justify-center border-2 border-blue-200 bg-slate-200 p-2 text-center text-lg'>
        <form className='w-full' onSubmit={handleSubmit}>
          <label>
            Talk to your travel advisor here
            <input
              className='block w-full outline-2 px-1.5 outline-slate-400 m-2'
              type='text'
              value={userQuery}
              placeholder='Enter your query here...'
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </label>
          <button
            className='rounded-sm bg-blue-400 p-0.5 duration-300 ease-in-out hover:bg-blue-200'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Error Handling */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Render Advice Data */}
      {advice && (
        <div className='flex flex-col items-center bg-slate-100'>
          <h2 className='text-xl font-bold'>Location Details</h2>
          <div className=''>
            <p>
              <strong>Country: </strong>
              {advice.location.country}
              <br />
              <strong>City:</strong> {advice.location.city}
            </p>

            <h3 className='text-lg font-bold'>Weather Conditions</h3>
            <ul>
              {advice.location.weatherConditions?.map((condition, idx) => (
                <li key={idx}>- {condition}</li>
              ))}
            </ul>

            {advice.location.localRestrictions &&
              advice.location.localRestrictions.length > 0 && (
                <>
                  <h3>Local Restrictions</h3>
                  <ul>
                    {advice.location.localRestrictions.map(
                      (restriction, idx) => (
                        <li key={idx}>{restriction}</li>
                      ),
                    )}
                  </ul>
                </>
              )}
          </div>

          <h3 className='text-lg font-bold'>Recommended Items</h3>
          <ul>
            {advice.location.recommendedItems?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>

          <h2 className='text-xl font-bold'>Trip Duration</h2>
          <p>
            <strong>Start Date:</strong>{' '}
            {new Date(advice.duration.startDate).toLocaleDateString()}
            <br />
            <strong>End Date:</strong>{' '}
            {new Date(advice.duration.endDate).toLocaleDateString()}
            <br />
            <strong>Total Days:</strong> {advice.duration.totalDays}
          </p>

          <h2 className='mt-2 text-xl font-bold'>Packing Items</h2>
          <ul>
            {advice.items.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> (x{item.quantity})
                <br />
                <em>Category:</em> {item.category}
                <br />
                <em>Essential:</em> {item.isEssential ? 'Yes' : 'No'}
                <br />
                {item.notes && <em>Notes:</em>} {item.notes}
              </li>
            ))}
          </ul>

          {advice.specialConsiderations &&
            advice.specialConsiderations.length > 0 && (
              <>
                <h2 className='text-xl font-bold'>Special Considerations</h2>
                <ul>
                  {advice.specialConsiderations.map((consideration, idx) => (
                    <li key={idx}>{consideration}</li>
                  ))}
                </ul>
              </>
            )}

          <p>
            <strong>Last Updated:</strong>{' '}
            {new Date(advice.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TravelPlan;
