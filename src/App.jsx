import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InterviewDashboard from './pages/InterviewDashboard';
import ArrayConcept from './pages/ArrayConcept';
import GraphConcept from './pages/GraphConcept';
import HashingConcept from './pages/HashingConcept';
import HeapConcept from './pages/HeapConcept';
import LinkedListConcept from './pages/LinkedListConcept';
import QueueConcept from './pages/QueueConcept';
import StackConcept from './pages/StackConcept';
import StringConcept from './pages/StringConcept';
import TreeConcept from './pages/TreeConcept';
import ProblemPage from './pages/ProblemPage';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import Pricing from './pages/Pricing';
import Team from './pages/Team';
import WhyAlgoZen from './pages/WhyAlgoZen';
import Features from './pages/Features';
import HelpSupport from './pages/HelpSupport';
import About from './pages/About';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview-dashboard" element={<InterviewDashboard />} />
        <Route path="/interview-setup" element={<InterviewSetup />} />
        <Route path="/interview-session" element={<InterviewSession />} />
        <Route path="/concepts/array" element={<ArrayConcept />} />
        <Route path="/concepts/graph" element={<GraphConcept />} />
        <Route path="/concepts/hashing" element={<HashingConcept />} />
        <Route path="/concepts/heap" element={<HeapConcept />} />
        <Route path="/concepts/linkedlist" element={<LinkedListConcept />} />
        <Route path="/concepts/queue" element={<QueueConcept />} />
        <Route path="/concepts/stack" element={<StackConcept />} />
        <Route path="/concepts/string" element={<StringConcept />} />
        <Route path="/concepts/tree" element={<TreeConcept />} />
        <Route path="/level/:levelId" element={<ProblemPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/team" element={<Team />} />
        <Route path="/why-algozen" element={<WhyAlgoZen />} />
        <Route path="/features" element={<Features />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </Router>
  );
}

export default App;
