import React from "react";

const Header = ({ setActiveTab, activeTab }) => {
  const tabs = [
    { id: "gallery", label: "My Assets" },
    { id: "register", label: "Register Asset" },
    { id: "transfer", label: "Transfer Asset" },
    { id: "verify", label: "Verify Asset" },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width="24"
                height="24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Digital Asset Manager</h1>
          </div>

          <nav className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
