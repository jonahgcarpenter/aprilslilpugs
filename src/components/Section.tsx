import React, { useState } from "react";
import { useAuth } from '../auth/AuthContext';
import '../styles/section.css';

interface SectionProps {
  title: string | { default: string, alternate: string };
  children: React.ReactNode;
  defaultExpanded?: boolean;
  alternateContent?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = true,
  alternateContent 
}) => {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAlternate, setShowAlternate] = useState(false);

  const currentTitle = typeof title === 'string' ? title : (showAlternate ? title.alternate : title.default);

  return (
    <div className="explorer-section">
      <div className="explorer-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-main">
          <span className={`explorer-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
          <h2 className="explorer-title">{currentTitle}</h2>
        </div>
        {isAuthenticated && alternateContent && (
          <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={showAlternate}
              onChange={() => setShowAlternate(!showAlternate)}
            />
            <span className="slider" />
          </label>
        )}
      </div>
      {isExpanded && (
        <div className="explorer-content">
          {showAlternate ? alternateContent : children}
        </div>
      )}
    </div>
  );
};

export default Section;