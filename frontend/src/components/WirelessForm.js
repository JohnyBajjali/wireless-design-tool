import React, { useState } from 'react';

const WirelessForm = () => {
  const [inputs, setInputs] = useState({
    samplingRate: '',
    quantizationBits: '',
    sourceCodingRate: '',
    channelCodingRate: '',
    interleavingRate: '',
    burstFormattingRate: '',
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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/wireless', {
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
      <h3>Wireless Communication System</h3>

      <input
        name="samplingRate"
        placeholder="Sampling Rate (Hz)"
        onChange={handleChange}
        value={inputs.samplingRate}
      />
      <input
        name="quantizationBits"
        placeholder="Quantization Bits"
        onChange={handleChange}
        value={inputs.quantizationBits}
      />
      <input
        name="sourceCodingRate"
        placeholder="Source Coding Rate"
        onChange={handleChange}
        value={inputs.sourceCodingRate}
      />
      <input
        name="channelCodingRate"
        placeholder="Channel Coding Rate"
        onChange={handleChange}
        value={inputs.channelCodingRate}
      />
      <input
        name="interleavingRate"
        placeholder="Interleaving Rate"
        onChange={handleChange}
        value={inputs.interleavingRate}
      />
      <input
        name="burstFormattingRate"
        placeholder="Burst Formatting Rate"
        onChange={handleChange}
        value={inputs.burstFormattingRate}
      />

      <button type="submit">Compute</button>

      {loading && <p className="loading">Loading... Please wait.</p>}
      {error && <p className="error">{error}</p>}

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

export default WirelessForm;