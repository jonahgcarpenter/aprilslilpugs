import React, { Suspense } from "react";
import Background from '/images/backdrop.jpg';
import Header from '../components/Header';
import Litters from '../components/Litters';
import UpdateLitters from '../adminfeatures/UpdateLitters';
import Grumble from '../components/Grumble';
import UpdateGrumble from '../adminfeatures/UpdateGrumble';

const Puppies: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <main>
          <Litters />
          <UpdateLitters />
          <Grumble />
          <UpdateGrumble />
        </main>
      </Suspense>
    </div>
  );
};

export default Puppies;