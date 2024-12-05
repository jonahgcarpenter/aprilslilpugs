import React from "react";
import '../styles/main.css';
import Footer from "../components/footer";
import Section from "../components/section";
import NewItems from "../components/newitems";
import EditItems from "../components/edititems";
import { NewPicture } from "../components/newpictures";
import ProfilePicture from "../components/profilepicture";

const sectionDefaults = {
  newItem: false,
  editItem: false,
  newPicture: false,
  profilePicture: false
};

const AdminPage: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section title="Add New Puppies / Family" defaultExpanded={sectionDefaults.newItem}>
          <NewItems />
        </Section>
        <Section title="Update Puppies / Family" defaultExpanded={sectionDefaults.editItem}>
          <EditItems />
        </Section>
        <Section title="Camera Roll Management" defaultExpanded={sectionDefaults.newPicture}>
          <NewPicture />
        </Section>
        <Section title="Profile Picture" defaultExpanded={sectionDefaults.profilePicture}>
          <ProfilePicture />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
