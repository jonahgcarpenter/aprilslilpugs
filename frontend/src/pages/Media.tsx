import React, { Suspense } from "react";
import Background from '/images/background.jpg';
import Header from '../components/Header';

const Media: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <main>
          <h1>MEDIA</h1>
        </main>
      </Suspense>
    </div>
  );
};

export default Media;