import React, { useState } from "react";
import '../styles/section.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="explorer-section">
      <div className="explorer-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`explorer-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <h2 className="explorer-title">{title}</h2>
      </div>
      {isExpanded && <div className="explorer-content">{children}</div>}
    </div>
  );
};

export default Section;