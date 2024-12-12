import React from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import Section from "../components/section";
import FamilySlideshow from '../components/familyslideshow';
import NewItems from "../components/newitems";
import EditItems from "../components/edititems";

const Family: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section 
          title={{
            default: "Meet My Family",
            alternate: "Update Puppies / Family"
          }}
          alternateContent={
            <>
              <EditItems />
              <NewItems />
            </>
          }
        >
          <FamilySlideshow />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Family;
