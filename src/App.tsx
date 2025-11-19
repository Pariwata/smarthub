import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RegulationRequestForm from './components/RegulationRequestForm';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <RegulationRequestForm />
      </main>
      <Footer />
    </div>
  );
};

export default App;
