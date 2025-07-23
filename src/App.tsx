import React from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import ContextProvider from './context/ContextProvider';
import Backdrop from './components/Backdrop/Backdrop';
import VideoModal from './components/VideoModal/VideoModal';
import { AuthProvider } from './context/AuthContext/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <ContextProvider>
          <NavBar />
          <Outlet />
          <Footer />
          <Backdrop />
          <VideoModal />
        </ContextProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
