import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CreateTest from "./components/CreateTest";
import EditTest from "./components/EditTest";
import TakeTest from "./components/TakeTest";
import AdminResults from "./components/AdminResults";
import ProctoringEvents from "./components/ProctoringEvents";
import InvitationAccept from "./components/AcceptInvitation";
import AnswerReview from "./components/ReviewAnswers";

// ViewTest component with Edit button
function ViewTest({ testId, token, onBack, onEdit }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const testData = data.test;
        if (testData.questions) {
          testData.question_count = testData.questions.length;
        }
        setTest(testData);
      }
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading test...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => onEdit(testId)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <span>✏️</span> Edit Test
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{test?.title}</h1>
          <p className="text-gray-600 mb-4">{test?.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-2xl font-bold">{test?.question_count || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="text-2xl font-bold">{test?.time_limit} min</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Questions</h3>
            {test?.questions && test.questions.length > 0 ? (
              <div className="space-y-4">
                {test.questions.map((q, index) => (
                  <div key={q.id} className="border rounded p-4 bg-gray-50">
                    <p className="font-medium mb-2">
                      {index + 1}. {q.question_text}
                    </p>
                    <div className="space-y-1 ml-4">
                      {q.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className={
                              opt === q.correct_answer
                                ? "text-green-600 font-medium"
                                : ""
                            }
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                            {opt === q.correct_answer && " ✓"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No questions added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResults({ testId, token, onBack, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tests/${testId}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
        setTestInfo(data.test);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">
            Test Results: {testInfo?.title}
          </h1>
          <p className="text-gray-600 mb-6">
            Total submissions: {results.length}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded">
              <p className="text-gray-600">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr
                      key={`${result.id}-${result.candidate_id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.candidate_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.candidate_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.score} / {result.total_questions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.round(
                            (result.score / result.total_questions) * 100
                          )}
                          %
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.taken_at
                          ? new Date(result.taken_at).toLocaleString()
                          : result.submitted_at
                          ? new Date(result.submitted_at).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => onNavigate("answer-review", testId, result.candidate_id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    console.log("Navigating to:", view, "testId:", testId, "candidateId:", candidateId);
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

  const handleEditTest = (testId) => {
    setSelectedTestId(testId);
    setCurrentView("edit-test");
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

      {currentView === "edit-test" && (
        <EditTest
          testId={selectedTestId}
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
          onNavigate={handleNavigate}
        />
      )}

      {currentView === "view-test" && (
        <ViewTest
          testId={selectedTestId}
          token={token}
          onBack={() => handleNavigate("dashboard")}
          onEdit={handleEditTest}
        />
      )}

      {currentView === "test-results" && (
        <TestResults
          testId={selectedTestId}
          token={token}
          onBack={() => handleNavigate("dashboard")}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === "answer-review" && (
        <AnswerReview
          testId={selectedTestId}
          candidateId={selectedCandidateId}
          token={token}
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