import React, { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { formatTime } from "../utils";
import { useTimer } from "../hooks/useTimer";
import { NavBar } from "./ui/Navbar";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";

export default function TakeTest({ token, testId, onBack }) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = useCallback(async () => {
    if (submitting || !test || !test.questions?.length) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      if (data.success) {
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
      console.error("Submit error:", err);
      setMessage({ type: "error", text: "Failed to submit test" });
      setSubmitting(false);
    }
  }, [submitting, testId, token, answers, onBack]);

  const timeLeft = useTimer(test ? test.time_limit * 60 : 0, handleSubmit);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}/take`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setTest(data.test);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load test",
        });
      }
    } catch (err) {
      console.error("Fetch test error:", err);
      setMessage({
        type: "error",
        text: "Failed to load test. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load test</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title={test?.title} onBack={onBack}>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
          <Clock size={20} className="text-red-600" />
          <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
        </div>
      </NavBar>

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert type={message.type} message={message.text} />

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-600 mb-4">{test?.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Questions: {test?.questions?.length || 0}</span>
              <span>Time: {test?.time_limit} minutes</span>
            </div>
          </div>

          {test?.questions && test.questions.length > 0 ? (
            test.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                answer={answers[question.id]}
                onAnswerChange={handleAnswerChange}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
              No questions available for this test.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={
                submitting || !test?.questions || test.questions.length === 0
              }
              variant="success"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
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
          className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows="3"
          placeholder="Type your answer here..."
        />
      )}

      {question.question_type === "coding" && (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
          rows="6"
          placeholder="Write your code here..."
        />
      )}
    </div>
  );
}
