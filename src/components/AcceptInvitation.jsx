// components/InvitationAccept.jsx
import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function InvitationAccept({ token, onNavigate, onLogin }) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/accept/${token}`
      );
      const data = await response.json();

      if (data.success) {
        setInvitation(data.invitation);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Not logged in - prompt to login/register
      alert("Please login or register to take the test");
      onLogin();
    } else {
      // Logged in - navigate to test
      onNavigate("take-test", invitation.testId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Test Invitation
          </h2>
          <p className="text-gray-600">
            You've been invited to take: <strong>{invitation.testTitle}</strong>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Test Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Candidate:
              </span>
              <span className="text-gray-900">{invitation.candidateName}</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Email:
              </span>
              <span className="text-gray-900">{invitation.candidateEmail}</span>
            </div>
            
            {invitation.testDescription && (
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Description:
                </span>
                <span className="text-gray-900">{invitation.testDescription}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-gray-900">
                {invitation.questionCount} questions
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-blue-600" />
              <span className="text-gray-900">
                {invitation.timeLimit} minutes time limit
              </span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Expires:
              </span>
              <span className="text-gray-900">
                {new Date(invitation.expiresAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You need to login or register with the email{" "}
            <strong>{invitation.candidateEmail}</strong> to take this test.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleStartTest}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Start Test
          </button>
          <button
            onClick={onLogin}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            Login / Register
          </button>
        </div>
      </div>
    </div>
  );
}