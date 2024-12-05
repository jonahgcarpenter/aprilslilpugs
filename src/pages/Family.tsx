import React from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import Section from "../components/section";
import FamilySlideshow from '../components/familyslideshow';

const sectionDefaults = {
  FamilySlideshow: true
};

const Family: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section title="Meet My Family" defaultExpanded={sectionDefaults.FamilySlideshow}>
          <FamilySlideshow />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Family;
