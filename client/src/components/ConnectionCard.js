import { useRef, useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';

const ConnectionCard = ({ 
  profile, 
  showIdentity, 
  eloChange,
  isWinner,
  isLoading
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  // Restore tilt effect handlers but without the hover notification callbacks
  const handleMouseMove = (e) => {
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

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease'
    });
  };

  // Helper to open LinkedIn URL - ONLY IF identity is shown
  const handleLinkedInClick = (e) => {
    e.stopPropagation();
    if (showIdentity && profile.linkedinUrl) {
      window.open(profile.linkedinUrl, '_blank');
    }
  };

  // Format graduation year if available
  const formattedGradYear = profile.graduationYear ? `'${String(profile.graduationYear).slice(-2)}` : '';

  return (
    <div 
      ref={cardRef}
      className={`connection-card ${isLoading ? 'skeleton-loading' : ''} ${isWinner ? 'isWinner' : ''} ${isWinner === false ? 'isLoser' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      <div className="profile-header">
        <div className={`profile-image ${!showIdentity ? 'blurred' : ''}`}>
          {profile.profilePictureUrl ? (
            <img 
              src={profile.profilePictureUrl} 
              alt={profile.name} 
              className="profile-picture"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=150`;
              }}
            />
          ) : (
            <div className="image-placeholder"></div>
          )}
        </div>
        <div className="profile-info">
          <h2 className={!showIdentity ? 'blurred-text' : ''}>{profile.name}</h2>
          {eloChange !== null && (
            <div className={`elo-change ${eloChange > 0 ? 'positive' : 'negative'}`}>
              {eloChange > 0 ? '+' : ''}{eloChange} ELO
            </div>
          )}
          {showIdentity && profile.linkedinUrl && (
            <button onClick={handleLinkedInClick} className="linkedin-button">
              <FaLinkedin /> View LinkedIn
            </button>
          )}
        </div>
      </div>
      
      <div className="experiences">
        {profile.experiences && profile.experiences.length > 0 ? (
          profile.experiences.map((exp, index) => (
            <div className="experience-item" key={index}>
              <div className={`company-logo ${!showIdentity ? 'blurred' : ''}`}>
                {exp.companyLogo ? (
                  <img 
                    src={exp.companyLogo} 
                    alt={exp.company || "Company"} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(exp.company || "C")}&background=random&size=80`;
                    }}
                  />
                ) : (
                  <div className="logo-placeholder"></div>
                )}
              </div>
              <div className="experience-details">
                <h3 className={!showIdentity ? 'blurred-text' : ''}>{exp.title}</h3>
                <p className={!showIdentity ? 'blurred-text' : ''}>{exp.company}</p>
                {showIdentity && exp.startDate && (
                  <p className="experience-date">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate || ""}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-experiences">No experiences to show</div>
        )}
      </div>
      
      <div className="education">
        <div className="majors">
          {profile.education && profile.education.majors && profile.education.majors.map((major, index) => (
            <h3 key={index} className={`major ${!showIdentity ? 'blurred-text' : ''}`}>
              {major}
              {showIdentity && index === 0 && formattedGradYear && ` ${formattedGradYear}`}
            </h3>
          ))}
        </div>
        <div className="schools">
          {profile.education && profile.education.schools && profile.education.schools.map((school, index) => (
            <p key={index} className={`school ${!showIdentity ? 'blurred-text' : ''}`}>{school}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
