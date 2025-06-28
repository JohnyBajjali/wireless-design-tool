import React, { useState } from 'react';

const OFDMForm = () => {
  const [inputs, setInputs] = useState({
    subcarriers: '',
    bitsPerSymbol: '',
    symbolDuration: '',
    parallelBlocks: ''
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

    if (!inputs.subcarriers || isNaN(inputs.subcarriers)) {
      setError("Please enter a valid number for Subcarriers");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ofdm', {
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
      <h3>OFDM System</h3>
      <input name="subcarriers" placeholder="Number of Subcarriers" onChange={handleChange} />
      <input name="bitsPerSymbol" placeholder="Bits per Symbol" onChange={handleChange} />
      <input name="symbolDuration" placeholder="Symbol Duration (μs)" onChange={handleChange} />
      <input name="parallelBlocks" placeholder="Parallel Resource Blocks" onChange={handleChange} />

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

export default OFDMForm;