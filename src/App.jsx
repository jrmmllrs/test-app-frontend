import React, { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CreateTest from "./components/CreateTest";
import TakeTest from "./components/TakeTest";
import AdminResults from "./components/AdminResults";
import ProctoringEvents from "./components/ProctoringEvents";

export default function App() {
  const [currentView, setCurrentView] = useState("auth");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSelectedTestId(null);
    setSelectedCandidateId(null);
    setCurrentView("auth");
  };

  const handleNavigate = (view, testId = null, candidateId = null) => {
    setCurrentView(view);
    setSelectedTestId(testId);
    setSelectedCandidateId(candidateId);
  };

  return (
    <>
      {currentView === "auth" && <Auth onAuthSuccess={handleAuthSuccess} />}

      {currentView === "dashboard" && (
        <Dashboard
          user={user}
          token={token}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === "create-test" && (
        <CreateTest
          user={user}
          token={token}
          onBack={() => handleNavigate("dashboard")}
        />
      )}

      {currentView === "admin-results" && (
        <AdminResults
          token={token}
          onBack={() => handleNavigate("dashboard")}
          onNavigate={handleNavigate} // pass navigation to view proctoring events
        />
      )}

      {currentView === "take-test" && (
        <TakeTest
          user={user}
          token={token}
          testId={selectedTestId}
          onBack={() => handleNavigate("dashboard")}
        />
      )}

      {currentView === "proctoring-events" && (
        <ProctoringEvents
          testId={selectedTestId}
          candidateId={selectedCandidateId}
          token={token}
          onBack={() => handleNavigate("dashboard")}
        />
      )}
    </>
  );
}
