import React, { useState } from 'react';

const CellularForm = () => {
  const [inputs, setInputs] = useState({
    area: '',
    userDensity: '',
    channelsPerCell: '',
    clusterSize: ''
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

    if (!inputs.area || isNaN(inputs.area)) {
      setError("Please enter a valid number for Coverage Area");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/cellular', {
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
      <h3>Cellular System Design</h3>
      <input name="area" placeholder="Coverage Area (km²)" onChange={handleChange} />
      <input name="userDensity" placeholder="User Density (users/km²)" onChange={handleChange} />
      <input name="channelsPerCell" placeholder="Channels per Cell" onChange={handleChange} />
      <input name="clusterSize" placeholder="Cluster Size" onChange={handleChange} />

      <button type="submit">Design Network</button>

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

export default CellularForm;