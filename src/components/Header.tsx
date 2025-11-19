import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <h1>SmartHub</h1>
        </div>
        <nav className="nav">
          <a href="/" className="nav-link active">
            Regulation Requests
          </a>
          <a href="/library" className="nav-link">
            Library
          </a>
          <a href="/help" className="nav-link">
            Help
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
