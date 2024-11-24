import React from "react";

const ContactMe: React.FC = () => {
  return (
    <section id="contact-me" className="contact-me-container">
      <h1 className="contact-me-heading">Contact Me</h1>
      <p className="contact-me-email">
        Email: <a href="mailto:aprilslilpugs@gmail.com">aprilslilpugs@gmail.com</a>
      </p>
      <p className="contact-me-links">
        <a href="https://www.facebook.com/AprilsLilPugs" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
        {" | "}
        <a href="https://www.youtube.com/@aprilslilpugs8071" target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
      </p>
    </section>
  );
};

export default ContactMe;
