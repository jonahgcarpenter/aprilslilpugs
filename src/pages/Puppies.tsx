import React, { useState } from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import Live from "../components/live";
import ComboWaitlist from "../components/combowaitlist";
import Slideshow from '../components/puppyslideshow';
import Parents from '../components/parents';
import Section from "../components/section";
import PastLittersSlideshow from "../components/pastlittersslideshow";
import NewItems from "../components/newitems";
import EditItems from "../components/edititems";

const sectionDefaults = {
  comboWaitlist: false,
  puppyCam: true,
  meetPuppies: true,
  meetParents: true
};

const Puppies: React.FC = () => {
  const [hasPastLitters, setHasPastLitters] = useState(true);

  return (
    <>
      <div className="page-container">
        <Section title="Join the Waitlist" defaultExpanded={sectionDefaults.comboWaitlist}>
          <ComboWaitlist />
        </Section>

        <Section title="Live Puppy Cam" defaultExpanded={sectionDefaults.puppyCam}>
          <Live />
        </Section>

        <Section 
          title={{
            default: "Meet the Puppies",
            alternate: "Update Puppies / Family"
          }}
          alternateContent={
            <>
              <EditItems />
              <NewItems />
            </>
          }
        >
          <Slideshow />
        </Section>
        
        <Section title="Meet The Parents" defaultExpanded={sectionDefaults.meetParents}>
          <Parents momName="Millie" dadName="Mardi" />
        </Section>

        {hasPastLitters && (
          <Section title="Past Litters">
            <PastLittersSlideshow onEmpty={() => setHasPastLitters(false)} />
          </Section>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Puppies;
