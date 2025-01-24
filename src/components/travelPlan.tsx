import { useState, ChangeEvent } from 'react';

export default function TravelPlan() {
  const [destination, setDestination] = useState<string>('');
  //   const [startDate, setStartDate] = useState<string>('');
  //   const [endDate, setEndDate] = useState<string>('');
  const [packingList, setPackingList] = useState<string[]>([]);

  const handleAddItem = (): void => {
    if (destination.trim() !== '') {
      setPackingList((prevList) => [...packingList, destination]);
      setDestination('');
    }
  };

  const handleDestinationChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDestination(e.target.value);
  };

  return (
    <div>
      <h1>Travel Plan</h1>
      <input
        type='text'
        value={destination}
        onChange={handleDestinationChange}
        placeholder='Destination'
      />
      {/* <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" /> */}
      <button onClick={handleAddItem}>Add Item</button>
      <ul>
        {packingList.map((item, userId) => (
          <li key={userId}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
