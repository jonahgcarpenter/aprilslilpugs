import React from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import MeetTheBreeder from "../components/meetthebreeder";
import Section from "../components/section";

const About: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section title="About the Breeder">
          <MeetTheBreeder />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default About;
