import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} SmartHub - Regulation Library Management System</p>
        <p className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <span className="separator">|</span>
          <a href="/terms">Terms of Service</a>
          <span className="separator">|</span>
          <a href="/support">Support</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
