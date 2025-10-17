import React, { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CreateTest from "./components/CreateTest";
import TakeTest from "./components/TakeTest";
import AdminResults from "./components/AdminResults";

export default function App() {
  const [currentView, setCurrentView] = useState("auth");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSelectedTestId(null);
    setCurrentView("auth");
  };

  const handleNavigate = (view, testId = null) => {
    setCurrentView(view);
    setSelectedTestId(testId);
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
        <AdminResults token={token} onBack={() => handleNavigate("dashboard")} />
      )}
      {currentView === "take-test" && (
        <TakeTest
          user={user}
          token={token}
          testId={selectedTestId}
          onBack={() => handleNavigate("dashboard")}
        />
      )}
    </>
  );
}