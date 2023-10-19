import { useContext } from 'react';
import './App.css';
import { GlobalContext } from './contexts/globalContext';
import { Route, Routes } from 'react-router-dom';
import JustForDev from './components-test';

function App() {
  return (<>
    <Routes>
      <Route path="/" element={<JustForDev />} />
      <Route path="/about" element={'<About />'} />
      <Route path="/contact" element={'<Contact />'} />
    </Routes>
  </>);
}

export default App;