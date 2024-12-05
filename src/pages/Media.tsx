import React from 'react';
import '../styles/pictures.css';
import '../styles/main.css';
import Footer from '../components/footer';
import Section from "../components/section";
import CameraRoll from '../components/cameraroll';

const sectionDefaults = {
  cameraRoll: true
};

const Media: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section title="Camera Roll" defaultExpanded={sectionDefaults.cameraRoll}>
          <CameraRoll />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Media;
