import './App.css';
import { Route, Routes } from 'react-router-dom';
import ClaimReward from './pages/claim';
import LandingPage from './pages/landing';

function App() {
  return (<>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/redeem/:id?" element={<ClaimReward />} />
      <Route path="/about" element={'<About />'} />
      <Route path="/contact" element={'<Contact />'} />
    </Routes>
  </>);
}

export default App;