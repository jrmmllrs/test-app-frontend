import React, { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle, Mail, Users, Eye, FileText } from "lucide-react";

export default function Dashboard({ user, token, onLogout, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTestForInvite, setSelectedTestForInvite] = useState(null);
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const endpoint =
        user?.role === "candidate"
          ? `${API_BASE_URL}/api/tests/available`
          : `${API_BASE_URL}/api/tests/my-tests`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTests(data.tests);
      } else {
        console.error("Failed to fetch tests:", data.message);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = (test) => {
    setSelectedTestForInvite(test);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedTestForInvite(null);
  };

  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test.question_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TestGorilla</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.email}</span>
              <span className="text-sm text-gray-500 capitalize">
                ({user?.role})
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  User Info
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {user?.email}
                </p>
                <p className="text-sm text-blue-700 mt-1 capitalize">
                  Role: {user?.role}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-green-900 mb-2">
                  {user?.role === "candidate"
                    ? "Available Tests"
                    : "Tests Created"}
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  {tests.length}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {user?.role === "candidate" ? "Ready to take" : "Total tests"}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-purple-900 mb-2">
                  Questions
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {totalQuestions}
                </p>
                <p className="text-sm text-purple-700 mt-1">Total questions</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.role === "candidate"
                    ? "Available Tests"
                    : "Your Tests"}
                </h3>

                <div className="flex gap-2">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => onNavigate("admin-results")}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
                    >
                      <Users size={20} />
                      View All Results
                    </button>
                  )}

                  {(user?.role === "employer" || user?.role === "admin") && (
                    <button
                      onClick={() => onNavigate("create-test")}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Create New Test
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading tests...</p>
                </div>
              ) : tests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {user?.role === "candidate"
                      ? "No tests available at the moment"
                      : "No tests created yet. Click 'Create New Test' to get started!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      user={user}
                      userRole={user?.role}
                      onNavigate={onNavigate}
                      onInvite={openInviteModal}
                      token={token}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showInviteModal && selectedTestForInvite && (
        <InviteModal
          test={selectedTestForInvite}
          token={token}
          onClose={closeInviteModal}
        />
      )}
    </div>
  );
}

function TestCard({ test, user, userRole, onNavigate, onInvite, token }) {
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (userRole === "employer" || userRole === "admin") {
      fetchInvitationCount();
    }
  }, [test.id, userRole]);

  const fetchInvitationCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/test/${test.id}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitationCount(data.invitations?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching invitation count:", error);
    }
  };

  const fetchInvitations = async () => {
    if (userRole === "candidate") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/test/${test.id}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
        setInvitationCount(data.invitations?.length || 0);
        setShowInvitations(true);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const handleNavigate = (view, id, additionalParam = null) => {
    console.log('Navigation clicked:', { view, id, additionalParam });
    
    try {
      if (additionalParam !== null) {
        onNavigate(view, id, additionalParam);
      } else {
        onNavigate(view, id);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      alert(`Navigation failed: ${error.message}`);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <h4 className="font-semibold text-gray-900 text-lg">{test.title}</h4>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {test.description || "No description"}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle size={16} className="text-green-600" />
          <span>{test.question_count || 0} questions</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-blue-600" />
          <span>{test.time_limit} minutes</span>
        </div>
        {userRole === "candidate" && test.created_by_name && (
          <p className="text-xs text-gray-500">By: {test.created_by_name}</p>
        )}
        {userRole === "candidate" && test.is_completed && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle size={16} />
            <span>Completed</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {userRole === "employer" || userRole === "admin" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavigate("view-test", test.id)}
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => handleNavigate("test-results", test.id)}
                className="px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
              >
                <CheckCircle size={14} />
                Results
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onInvite(test)}
                className="px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <Mail size={14} />
                Invite
              </button>
              <button
                onClick={fetchInvitations}
                className="px-3 py-2 text-sm text-purple-700 bg-purple-50 rounded hover:bg-purple-100 flex items-center justify-center gap-1"
              >
                <Users size={14} />
                Invites ({invitationCount})
              </button>
            </div>

            <button
              onClick={() => handleNavigate("proctoring-events", test.id, null)}
              className="w-full px-3 py-2 text-sm text-red-700 bg-red-50 rounded hover:bg-red-100"
            >
              View Proctoring Events
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {test.is_completed ? (
              <button
                onClick={() => handleNavigate("answer-review", test.id, user.id)}
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                View Answer Review
              </button>
            ) : test.is_in_progress ? (
              <button
                onClick={() => handleNavigate("take-test", test.id)}
                className="w-full px-4 py-2 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 font-medium"
              >
                Continue Test
              </button>
            ) : (
              <button
                onClick={() => handleNavigate("take-test", test.id)}
                className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 font-medium"
              >
                Take Test
              </button>
            )}
          </div>
        )}
      </div>

      {showInvitations && (
        <InvitationsListModal
          invitations={invitations}
          testTitle={test.title}
          token={token}
          onClose={() => setShowInvitations(false)}
        />
      )}
    </div>
  );
}

function InviteModal({ test, token, onClose }) {
  const [candidates, setCandidates] = useState([{ name: "", email: "" }]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);
  const API_BASE_URL = "http://localhost:5000";

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", email: "" }]);
  };

  const removeCandidate = (index) => {
    if (candidates.length === 1) {
      alert("At least one candidate is required");
      return;
    }
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const sendInvitations = async () => {
    const validCandidates = candidates.filter(
      (c) => c.name.trim() && c.email.trim()
    );

    if (validCandidates.length === 0) {
      alert("Please add at least one candidate with name and email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validCandidates.filter(
      (c) => !emailRegex.test(c.email)
    );
    if (invalidEmails.length > 0) {
      alert("Please enter valid email addresses for all candidates");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/send-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            testId: test.id,
            candidates: validCandidates,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      } else {
        alert(data.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert("Failed to send invitations. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            Invite Candidates - {test.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Send test invitations to candidates via email
          </p>
        </div>

        <div className="p-6">
          {!results ? (
            <>
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) =>
                          updateCandidate(index, "name", e.target.value)
                        }
                        placeholder="Candidate Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        value={candidate.email}
                        onChange={(e) =>
                          updateCandidate(index, "email", e.target.value)
                        }
                        placeholder="Email Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeCandidate(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                      title="Remove candidate"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCandidate}
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                + Add Another Candidate
              </button>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvitations}
                  disabled={sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Invitations"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4 text-lg">Invitation Results</h3>
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg ${
                      result.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p className="font-medium">{result.email}</p>
                    <p className="text-sm mt-1">
                      {result.success ? (
                        <span className="text-green-700">
                          ✓ Invitation sent successfully
                        </span>
                      ) : (
                        <span className="text-red-700">✗ {result.error}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InvitationsListModal({ invitations, testTitle, token, onClose }) {
  const API_BASE_URL = "http://localhost:5000";

  const sendReminder = async (invitationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/send-reminder/${invitationId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Invitations - {testTitle}</h2>
        </div>
        <div className="p-6">
          {invitations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No invitations sent yet
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{inv.candidate_name}</p>
                      <p className="text-sm text-gray-600">
                        {inv.candidate_email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Invited: {new Date(inv.invited_at).toLocaleString()}
                      </p>
                      {inv.accepted_at && (
                        <p className="text-xs text-gray-500">
                          Accepted: {new Date(inv.accepted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(inv.status)}
                      {inv.status === "pending" && (
                        <button
                          onClick={() => sendReminder(inv.id)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}