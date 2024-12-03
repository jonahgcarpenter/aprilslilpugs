import React from "react";
import '../styles/main.css';
import Footer from "../components/Footer";
import Section from "../components/Section";
import NewItems from "../components/NewItems";
import EditItems from "../components/EditItems";

const AdminPage: React.FC = () => {
  return (
    <>
      <div className="page-container">
        <Section title="Add New Puppies / Family">
          <NewItems />
        </Section>
        <Section title="Update Puppies / Family">
          <EditItems />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
