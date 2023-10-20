import './App.css';
import { Route, Routes } from 'react-router-dom';
import ClaimReward from './pages/claim';
import LandingPage from './pages/landing';
import Navbar from './components/navbar';
import CreateLink from './pages/create-link';
import CompanyHistoryCard from './components/history';

function App() {
  return (<>
    <Navbar />
    <div className="my-8 md:mx-20 mx-12">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/redeem/:id?" element={<ClaimReward />} />
        <Route path="/create-link" element={<CreateLink />} />
      </Routes>
    </div>
  </>);
}

export default App;