import React from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import MeetTheBreeder from "../components/meetthebreeder";
import Section from "../components/section";
import ProfilePicture from "../components/profilepicture";

const About: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section 
          title={{
            default: "About the Breeder",
            alternate: "Edit Profile Picture"
          }}
          alternateContent={<ProfilePicture />}
        >
          <MeetTheBreeder />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default About;
