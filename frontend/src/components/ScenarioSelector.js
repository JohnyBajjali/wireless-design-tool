import React from 'react';

const ScenarioSelector = ({ selected, onChange }) => {
  return (
    <div className="selector">
      <label>Select Scenario:</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="scenario-dropdown"
      >
        <option value="">-- Choose --</option>
        <option value="wireless">Wireless Communication System</option>
        <option value="ofdm">OFDM System</option>
        <option value="linkBudget">Link Budget Calculation</option>
        <option value="cellular">Cellular System Design</option>
      </select>
    </div>
  );
};

export default ScenarioSelector;