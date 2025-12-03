import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ArrayConcept from './pages/ArrayConcept';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/concepts/array" element={<ArrayConcept />} />
      </Routes>
    </Router>
  );
}

export default App;
