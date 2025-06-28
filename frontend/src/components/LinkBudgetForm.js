import React, { useState } from 'react';

const LinkBudgetForm = () => {
  const [inputs, setInputs] = useState({
    txPower: '',
    txAntennaGain: '',
    rxAntennaGain: '',
    frequency: '',
    distance: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!inputs.txPower || isNaN(inputs.txPower)) {
      setError("Please enter a valid number for Tx Power");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/linkbudget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Calculation failed");

      setResult(data);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Link Budget Calculation</h3>
      <input name="txPower" placeholder="Tx Power (dBm)" onChange={handleChange} />
      <input name="txAntennaGain" placeholder="Tx Antenna Gain (dBi)" onChange={handleChange} />
      <input name="rxAntennaGain" placeholder="Rx Antenna Gain (dBi)" onChange={handleChange} />
      <input name="frequency" placeholder="Frequency (MHz)" onChange={handleChange} />
      <input name="distance" placeholder="Distance (km)" onChange={handleChange} />

      <button type="submit">Compute</button>

      {loading && <p>Loading... Please wait.</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div className="result-box">
          <h4>Results:</h4>
          <pre>{JSON.stringify(result.results, null, 2)}</pre>
          <h4>AI Explanation:</h4>
          <p>{result.explanation}</p>
        </div>
      )}
    </form>
  );
};

export default LinkBudgetForm;