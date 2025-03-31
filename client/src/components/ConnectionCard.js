import { useRef, useState, useEffect } from 'react';
import { FaLinkedin } from 'react-icons/fa';

export default function ConnectionCard({ profile, eloChange, showIdentity = true, isWinner = false, isLoading = false, onHoverStart, onHoverEnd }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  // Log events for debugging hover behavior
  const handleMouseEnter = (e) => {
    console.log('[ConnectionCard] Mouse Enter:', profile.name);
    if (onHoverStart) {
      onHoverStart(profile._id);
    }
  };

  const handleMouseMove = (e) => {
    console.log('[ConnectionCard] Mouse Move:', profile.name, 'X:', e.clientX, 'Y:', e.clientY);
    if (!cardRef.current) return;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();

    // Calculate mouse position relative to the card's center
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    const mouseX = e.clientX - cardCenterX;
    const mouseY = e.clientY - cardCenterY;

    // Calculate rotation (max 5 degrees) and apply a slight scale effect
    const rotateY = (mouseX / (cardRect.width / 2)) * 5;
    const rotateX = -(mouseY / (cardRect.height / 2)) * 5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease'
    });
  };

  const handleMouseLeave = (e) => {
    console.log('[ConnectionCard] Mouse Leave:', profile.name);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease'
    });
    if (onHoverEnd) {
      onHoverEnd(profile._id);
    }
  };

  // Helper to open LinkedIn URL - ONLY IF identity is shown
  const openLinkedIn = (e, url) => {
    // Check if identity is revealed before proceeding
    if (!showIdentity) {
      e.stopPropagation(); // Prevent card click too
      console.log('Identity not revealed yet.');
      return; // Do nothing
    }
    
    if (url) {
      e.stopPropagation(); // Prevent card click event
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      e.stopPropagation(); // Still prevent card click even if no URL
      console.log('No LinkedIn URL.');
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`connection-card ${isLoading ? 'skeleton-loading' : ''} ${isWinner ? 'isWinner' : ''} ${isWinner === false ? 'isLoser' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      <div className="profile-header">
        <div className={`connection-card-avatar-container ${!showIdentity ? 'blurred' : ''} ${showIdentity ? 'revealing' : ''}`}>
          <div 
            className="connection-card-avatar" 
            onClick={(e) => openLinkedIn(e, profile.linkedinUrl)}
          >
            {profile.profilePictureUrl ? (
              <img 
                src={profile.profilePictureUrl} 
                alt={profile.name}
                className="profile-picture"
              />
            ) : (
              <div className="image-placeholder" />
            )}
            {profile.linkedinUrl && (
              <div className="profile-overlay">
                <FaLinkedin className="linkedin-icon" />
              </div>
            )}
          </div>
        </div>
        <div className="profile-info">
          <h2 className={`${!showIdentity ? 'blurred' : ''} ${showIdentity ? 'revealing' : ''}`}>{profile.name}</h2>
          {showIdentity && eloChange && (
            <p className={`elo-change ${eloChange > 0 ? 'positive' : 'negative'}`}>
              {eloChange > 0 ? '+' : ''}{eloChange}
            </p>
          )}
        </div>
      </div>

      <div className="experiences" data-count={profile.experiences.length}>
        {profile.experiences.slice(0, 2).map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="company-logo">
              <img 
                src={exp.companyLogo}
                alt={exp.company}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${exp.company}&background=random`;
                }}
              />
            </div>
            <div className="experience-details">
              <h3>{exp.company}</h3>
              <p>{exp.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="education">
        {profile.education ? (
          <>
            <div className="majors">
              {profile.education.majors.map((major, index) => (
                <h3 key={index} className="major">{major}</h3>
              ))}
            </div>
            <div className="schools">
              {profile.education.schools.map((school, index) => (
                <p key={index} className="school">{school}</p>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3>{profile.major}</h3>
            <p className="degree-type">{profile.degree}</p>
          </>
        )}
      </div>
    </div>
  );
}
