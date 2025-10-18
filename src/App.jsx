import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CreateTest from "./components/CreateTest";
import TakeTest from "./components/TakeTest";
import AdminResults from "./components/AdminResults";
import ProctoringEvents from "./components/ProctoringEvents";
import InvitationAccept from "./components/AcceptInvitation";

export default function App() {
  const [currentView, setCurrentView] = useState("loading");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [invitationToken, setInvitationToken] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = () => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    console.log("Checking saved credentials...");
    console.log("Saved token exists:", !!savedToken);
    console.log("Saved user exists:", !!savedUser);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        console.log("Restored user:", parsedUser.email);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    // Check for invitation token in URL
    checkForInvitation();
  };

  const checkForInvitation = () => {
    // Check URL hash for invitation
    const hash = window.location.hash;
    const inviteMatch = hash.match(/#\/invitation\/([a-f0-9]+)/);
    
    if (inviteMatch) {
      const token = inviteMatch[1];
      console.log("Found invitation token:", token);
      setInvitationToken(token);
      setCurrentView("invitation-accept");
      return;
    }

    // If no invitation and user is logged in, show dashboard
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("auth");
    }
  };

  const handleAuthSuccess = (userData, authToken) => {
    console.log("Auth success - saving credentials");
    console.log("User:", userData);
    console.log("Token:", authToken);
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // If there was a pending invitation, go back to it
    if (invitationToken) {
      setCurrentView("invitation-accept");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setUser(null);
    setToken(null);
    setSelectedTestId(null);
    setSelectedCandidateId(null);
    setInvitationToken(null);
    setCurrentView("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.hash = "";
  };

  const handleNavigate = (view, testId = null, candidateId = null) => {
    setCurrentView(view);
    setSelectedTestId(testId);
    setSelectedCandidateId(candidateId);
    
    // Update URL hash for specific views
    if (view === "invitation-accept" && invitationToken) {
      window.location.hash = `/invitation/${invitationToken}`;
    } else if (view === "auth") {
      window.location.hash = "";
    }
  };

  const showLogin = () => {
    setCurrentView("auth");
    window.location.hash = "";
  };

  // Show loading screen while initializing
  if (currentView === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === "auth" && <Auth onAuthSuccess={handleAuthSuccess} />}

      {currentView === "invitation-accept" && invitationToken && (
        <InvitationAccept
          token={invitationToken}
          onNavigate={handleNavigate}
          onLogin={showLogin}
        />
      )}

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
          onNavigate={handleNavigate}
        />
      )}

      {currentView === "take-test" && (
        <TakeTest
          user={user}
          token={token}
          testId={selectedTestId}
          invitationToken={invitationToken}
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