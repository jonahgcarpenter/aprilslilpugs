import React, { useState } from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import Live from "../components/live";
import Waitlist from "../components/waitlist";
import Slideshow from '../components/puppyslideshow';
import Parents from '../components/parents';
import Section from "../components/section";
import PastLittersSlideshow from "../components/pastlittersslideshow";

const sectionDefaults = {
  waitlist: false,
  puppyCam: true,
  meetPuppies: true,
  meetParents: true
};

const Puppies: React.FC = () => {
  const [hasPastLitters, setHasPastLitters] = useState(true);

  return (
    <>
      <div className="page-container">
        <Section title="Waitlist" defaultExpanded={sectionDefaults.waitlist}>
          <Waitlist />
        </Section>

        <Section title="Live Puppy Cam" defaultExpanded={sectionDefaults.puppyCam}>
          <Live />
        </Section>

        <Section title="Meet the Puppies" defaultExpanded={sectionDefaults.meetPuppies}>
          <Slideshow />
        </Section>
        
        <Section title="Meet The Parents" defaultExpanded={sectionDefaults.meetParents}>
          <Parents momName="Millie" dadName="Mardi" />
        </Section>

        {hasPastLitters && (
          <Section title="Past Litters" defaultExpanded={sectionDefaults.meetPuppies}>
            <PastLittersSlideshow onEmpty={() => setHasPastLitters(false)} />
          </Section>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Puppies;
