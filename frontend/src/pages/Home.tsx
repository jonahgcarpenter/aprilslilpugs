// the main landing page for this application.

import React, { Suspense } from "react";
import Background from '/images/backdrop.jpg';
import Nav from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import MeetTheBreeder from "../components/MeettheBreeder";

const Home: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" style={{ backgroundImage: `url(${Background})` }}>
      <Nav />
      <Suspense fallback={<div>Loading...</div>}>
        <main>
          <AboutUs />
          <MeetTheBreeder />
        </main>
      </Suspense>
    </div>
  );
};

export default Home;