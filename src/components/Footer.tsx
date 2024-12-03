import React from "react";

const Footer: React.FC = () => {
  return (
    <section id="footer" className="footer-container">
      <h1 className="footer-heading">Contact Me</h1>
      <p className="footer-email">
        Email: <a href="mailto:aprilslilpugs@gmail.com">aprilslilpugs@gmail.com</a>
      </p>
      <p className="footer-links">
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

export default Footer;
