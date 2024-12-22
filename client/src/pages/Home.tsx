/**
 * Home Page Component
 * Landing page with about section and breeder information
 */
import React, { Suspense } from "react";
import Background from '/images/background.jpg';
import Header from '../components/Header';
import AboutUs from '../components/AboutUs';
import MeetTheBreeder from "../components/Breeder";

const Home: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" 
         style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <main className="container mx-auto px-4">
          <AboutUs />
          <MeetTheBreeder />
        </main>
      </Suspense>
    </div>
  );
};

export default Home;