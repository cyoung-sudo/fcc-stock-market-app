import './App.css';
// Router
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Components
import Chart from './components/stocks/Chart';
import Footer from './components/static/Footer';

function App() {
  return (
    <div id="app">
      <BrowserRouter>
        {/* App content */}
        <div id="app-content">
          <Routes>
            <Route path="/" element={ <Chart/> }/>
          </Routes>
        </div>

        {/* Footer */}
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
