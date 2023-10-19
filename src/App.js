import { useContext } from 'react';
import './App.css';
import { GlobalContext } from './contexts/globalContext';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (<>
    <Routes>
      <Route path="/" element={'home'} />
      <Route path="/about" element={'<About />'} />
      <Route path="/contact" element={'<Contact />'} />
    </Routes>
  </>);
}

export default App;