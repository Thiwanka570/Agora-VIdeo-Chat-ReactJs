import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Contact />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
