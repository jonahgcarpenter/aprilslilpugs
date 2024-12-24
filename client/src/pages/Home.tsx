import React from "react";
import Background from '/images/background.jpg';
import Header from '../components/Header';
import Construction from '../components/Construction';
import AboutUs from '../components/AboutUs';
import MeetTheBreeder from "../components/Breeder";

const Home: React.FC = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen" 
         style={{ backgroundImage: `url(${Background})` }}>
      <Header />
      <main className="container mx-auto px-4">
        <Construction />
        <AboutUs />
        <MeetTheBreeder />
      </main>
    </div>
  );
};

export default Home;