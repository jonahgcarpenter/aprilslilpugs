import React from 'react';
import '../styles/main.css';
import Footer from '../components/footer';
import Section from "../components/section";
import CameraRoll from '../components/cameraroll';
import { NewPicture } from "../components/newpictures";

const Media: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section 
          title={{
            default: "Camera Roll",
            alternate: "Edit Camera Roll"
          }}
          alternateContent={<NewPicture />}
        >
          <CameraRoll />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Media;
