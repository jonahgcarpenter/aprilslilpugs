import React from "react";
import Background from '/images/background.jpg';
import Header from '../components/Header';
import Live from '../components/Live';

const Puppies: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <main>
        <Live />
      </main>
    </div>
  );
};

export default Puppies;