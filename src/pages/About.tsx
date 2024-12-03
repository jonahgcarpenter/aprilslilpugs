import React from "react";
import '../styles/main.css';
import '../styles/about.css';
import Footer from "../components/Footer";

const About: React.FC = () => {
  return (
    <>
      <div className="page-banner">
        <h1>About Us</h1>
      </div>
      <main className="about-content">
        <section className="meet-breeder content-section">
          <h2>Meet the Breeder</h2>
          <p>
            Hi, I'm Sarah Johnson! With over 15 years of experience breeding Australian 
            Labradoodles, I'm committed to producing exceptional puppies that bring joy 
            to families.
          </p>
          <p>
            Our puppies are raised in our home with love and attention, ensuring they are 
            well-socialized and ready to become cherished members of their new families. 
            We follow strict health testing protocols and focus on breeding for 
            temperament, health, and conformation.
          </p>
        </section>
        
        <section className="about-us content-section">
          <h2>About Our Program</h2>
          <p>
            Welcome to our Australian Labradoodle family! We are dedicated to raising healthy, 
            well-socialized puppies in a loving home environment. Our breeding program 
            focuses on producing puppies with excellent temperaments, health clearances, 
            and the distinctive qualities that make Australian Labradoodles such wonderful 
            companions.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
