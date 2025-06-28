import React, { useState } from 'react';
import './App.css';
import ScenarioSelector from './components/ScenarioSelector';
import WirelessForm from './components/WirelessForm';
import OFDMForm from './components/OFDMForm';
import LinkBudgetForm from './components/LinkBudgetForm';
import CellularForm from './components/CellularForm';

function App() {
  const [selectedScenario, setSelectedScenario] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Powered Wireless Network Design</h1>
        <p className="student-info">👤 Johny Bajjali - Student ID: 1210566</p>
      </header>

      <main className="App-main">
        <ScenarioSelector selected={selectedScenario} onChange={setSelectedScenario} />
        {selectedScenario === 'wireless' && <WirelessForm />}
        {selectedScenario === 'ofdm' && <OFDMForm />}
        {selectedScenario === 'linkBudget' && <LinkBudgetForm />}
        {selectedScenario === 'cellular' && <CellularForm />}
      </main>

      <footer className="App-footer">
        <p>© 2025 Johny Bajjali | ENCS5323 - Wireless & Mobile Networks Project</p>
      </footer>
    </div>
  );
}

export default App;