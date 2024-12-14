import React, { Suspense } from "react";
import Background from '/images/backdrop.jpg';
import Header from '../components/Header';
import AboutUs from '../components/AboutUs';
import MeetTheBreeder from "../components/Breeder";
import UpdateBreeder from "../adminfeatures/UpdateBreeder";

const Home: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <main>
          <AboutUs />
          <MeetTheBreeder />
          <UpdateBreeder />
        </main>
      </Suspense>
    </div>
  );
};

export default Home;