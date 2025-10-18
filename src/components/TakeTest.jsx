import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { useTimer } from "../hooks/useTimer";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Proctoring hook
function useProctoring(
  testId,
  token,
  settings,
  setFullscreenWarning,
  setTestBlocked,
  enabled = true
) {
  const tabSwitchCountRef = React.useRef(0);
  const hasRequestedFullscreenRef = React.useRef(false);

  const logEvent = useCallback(
    async (eventType, eventData = {}) => {
      if (!enabled || !testId || !token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/proctoring/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            test_id: testId,
            event_type: eventType,
            event_data: eventData,
          }),
        });

        const data = await response.json();

        if (data.success && data.flagged) {
          setTestBlocked(true);
        }

        return data;
      } catch (error) {
        console.error("Failed to log proctoring event:", error);
      }
    },
    [testId, token, enabled, setTestBlocked]
  );

  useEffect(() => {
    if (!enabled || !settings) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        logEvent("tab_switch", {
          count: tabSwitchCountRef.current,
          timestamp: new Date().toISOString(),
        });
        if (
          settings.max_tab_switches &&
          tabSwitchCountRef.current >= settings.max_tab_switches
        ) {
          setTestBlocked(true);
        }
      }
    };

    const handleWindowBlur = () => {
      logEvent("window_blur", { timestamp: new Date().toISOString() });
    };

    const handleCopy = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        logEvent("copy_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handlePaste = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        logEvent("paste_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      logEvent("right_click", { timestamp: new Date().toISOString() });
      return false;
    };

    const handleFullscreenChange = () => {
      if (settings.require_fullscreen && !document.fullscreenElement) {
        logEvent("fullscreen_exit", { timestamp: new Date().toISOString() });
        setFullscreenWarning(true);
      } else {
        setFullscreenWarning(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    if (
      settings.require_fullscreen &&
      !hasRequestedFullscreenRef.current &&
      !document.fullscreenElement
    ) {
      hasRequestedFullscreenRef.current = true;
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem
          .requestFullscreen()
          .catch((err) => console.error("Fullscreen error:", err));
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, settings, logEvent, setFullscreenWarning, setTestBlocked]);

  return { logEvent };
}

export default function TakeTest({
  token,
  testId,
  onBack,
  invitationToken = null,
}) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [proctoringSettings, setProctoringSettings] = useState(null);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  
  // KEY FIX: Store the initial time in state, calculated only once
  const [initialTime, setInitialTime] = useState(null);

  // Refs for tracking values on unmount
  const answersRef = useRef({});
  const timeLeftRef = useRef(null);
  const testRef = useRef(null);
  const testStatusRef = useRef(null);

  useEffect(() => {
    if (testId) {
      if (invitationToken) {
        verifyInvitationAccess();
      } else {
        checkTestStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, invitationToken]);

  const checkTestStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      console.log("Test status response:", data);

      if (data.success) {
        setTestStatus(data.status);

        if (data.status === "completed") {
          setMessage({
            type: "error",
            text: "You have already completed this test.",
          });
          setLoading(false);
          return;
        }

        if (data.status === "in_progress") {
          console.log("Resuming test with time remaining:", data.time_remaining);
          setAnswers(data.saved_answers || {});
          fetchTest(data.time_remaining);
          fetchProctoringSettings();
        } else {
          console.log("Starting new test");
          fetchTest();
          fetchProctoringSettings();
        }
      }
    } catch (err) {
      console.error("Error checking test status:", err);
      fetchTest();
      fetchProctoringSettings();
    }
  };

  const verifyInvitationAccess = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/verify-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invitationToken: invitationToken,
          testId: testId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        checkTestStatus();
      } else {
        setMessage({
          type: "error",
          text:
            data.message ||
            "You are not authorized to take this test via this invitation.",
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Error verifying invitation:", err);
      fetchTest();
      fetchProctoringSettings();
    }
  };

  const fetchTest = async (timeRemaining = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/take`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const testData = {
          ...data.test,
        };
        
        // KEY FIX: Calculate and set initial time only once when test is fetched
        let calculatedTime;
        if (timeRemaining !== null && timeRemaining !== undefined) {
          calculatedTime = timeRemaining;
        } else {
          calculatedTime = testData.time_limit * 60;
        }
        
        console.log("Setting initial time to:", calculatedTime);
        setInitialTime(calculatedTime);
        setTest(testData);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load test",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load test" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProctoringSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proctoring/settings/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProctoringSettings(data.settings);
    } catch (err) {
      console.error("Failed to fetch proctoring settings:", err);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || !test) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          invitationToken: invitationToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (document.fullscreenElement) document.exitFullscreen();
        setTestStatus("completed");
        setMessage({
          type: "success",
          text: `Test submitted! Score: ${data.submission.score}% - ${data.submission.remarks}`,
        });
        setTimeout(() => onBack(), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to submit test" });
      setSubmitting(false);
    }
  }, [submitting, test, answers, token, testId, invitationToken, onBack]);

  useProctoring(
    testId,
    token,
    proctoringSettings,
    setFullscreenWarning,
    setTestBlocked,
    proctoringSettings?.enable_proctoring
  );

  // KEY FIX: Use the initialTime state directly instead of calling getInitialTime()
  const timeLeft = useTimer(initialTime, handleSubmit);

  // Update refs whenever state changes
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    testRef.current = test;
  }, [test]);

  useEffect(() => {
    testStatusRef.current = testStatus;
  }, [testStatus]);

  const saveProgressSync = useCallback(async (currentTimeLeft) => {
    const timeToSave = currentTimeLeft !== undefined ? currentTimeLeft : timeLeftRef.current;
    
    if (!testRef.current || testStatusRef.current === "completed" || timeToSave <= 0) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/tests/${testId}/save-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          answers: answersRef.current,
          time_remaining: timeToSave
        }),
      });
      console.log("Progress saved with time:", timeToSave);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [testId, token]);

  const saveProgress = useCallback(async () => {
    if (!test || testStatus === "completed") return;

    const timeToSave = timeLeftRef.current;

    try {
      await fetch(`${API_BASE_URL}/tests/${testId}/save-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          answers,
          time_remaining: timeToSave
        }),
      });
      console.log("Progress saved with time:", timeToSave);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [answers, test, testId, token, testStatus]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (testStatus === "in_progress" || testStatus === "not_started") {
      const interval = setInterval(() => saveProgress(), 30000);
      return () => clearInterval(interval);
    }
  }, [saveProgress, testStatus]);

  // Save progress when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        saveProgressSync(timeLeftRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        console.log("Component unmounting, saving progress");
        saveProgressSync(timeLeftRef.current);
      }
    };
  }, [saveProgressSync]);

  const handleAnswerChange = (qid, val) =>
    setAnswers((prev) => ({ ...prev, [qid]: val }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading test...
      </div>
    );
  }

  if (message.type === "error" && !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 mb-4 font-semibold">{message.text}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-red-600 mb-4">Failed to load test</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              ← Back
            </button>
            <span className="text-xl font-bold text-gray-900">
              {test?.title}
            </span>
            {invitationToken && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Via Invitation
              </span>
            )}
            {testStatus === "in_progress" && (
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                <Clock size={12} />
                Resumed
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {proctoringSettings?.enable_proctoring && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <Shield size={18} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Proctored
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <Clock size={20} className="text-red-600" />
              <span className="font-bold text-red-600">
                {formatTime(timeLeft || 0)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4 max-w-4xl mx-auto">
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {testStatus === "in_progress" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-blue-800">
              ✓ Your progress has been restored. Continue where you left off.
            </div>
          </div>
        )}

        {fullscreenWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-yellow-800">
              ⚠️ Please return to fullscreen mode to continue the test.
            </div>
          </div>
        )}

        {testBlocked && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-red-800 font-semibold">
              🚫 You cannot continue the test due to multiple violations.
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">{test?.description}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Questions: {test?.questions?.length || 0}</span>
            <span>Time: {test?.time_limit} minutes</span>
          </div>
        </div>

        {test?.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            answer={answers[question.id]}
            onAnswerChange={handleAnswerChange}
          />
        ))}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !test?.questions ||
              test.questions.length === 0 ||
              testBlocked
            }
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, answer, onAnswerChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded">
          Q{index + 1}
        </span>
        <p className="text-gray-900 font-medium flex-1">
          {question.question_text}
        </p>
      </div>

      {(question.question_type === "multiple_choice" ||
        question.question_type === "true_false") && (
        <div className="space-y-2 ml-12">
          {Array.isArray(question.options) &&
            question.options.map((option, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
        </div>
      )}

      {question.question_type === "short_answer" && (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows="3"
          placeholder="Type your answer here..."
        />
      )}

      {question.question_type === "coding" && (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
          rows="6"
          placeholder="Write your code here..."
        />
      )}
    </div>
  );
}