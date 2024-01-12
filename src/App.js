import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import SinglePage from './Components/Movie_Series_Info/SinglePage';
import Navbar from './Components/Common/Navbar';
import Footer from './Components/Common/Footer';
import Movies from './pages/movies';
import Series from './pages/series';

function App() {
  return (
    <div className="App">
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:mediaType/:id" element={<SinglePage />} />
          <Route path="/movies" element={<Movies/>}/>
          <Route path="/series" element={<Series/>} />
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
