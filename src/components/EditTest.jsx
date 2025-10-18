import React, { useState, useEffect } from "react";

export default function EditTest({ testId, token, onBack }) {
  const [test, setTest] = useState({
    title: "",
    description: "",
    time_limit: 30,
    questions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        setTest(data.test);
      } else {
        setError("Failed to load test");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      setError("Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  const handleTestInfoChange = (field, value) => {
    setTest((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...test.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options,
    };
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const newQuestion = {
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    };
    setTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };
  const removeQuestion = (index) => {
    const updatedQuestions = test.questions.filter((_, i) => i !== index);
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[questionIndex].options.push("");
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...test.questions];
    const question = updatedQuestions[questionIndex];

    if (question.options.length <= 2) {
      setError("A question must have at least 2 options");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const removedOption = question.options[optionIndex];
    question.options = question.options.filter((_, i) => i !== optionIndex);

    // If removed option was correct answer, clear correct answer
    if (question.correct_answer === removedOption) {
      question.correct_answer = "";
    }

    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const validateTest = () => {
    if (!test.title.trim()) {
      setError("Test title is required");
      return false;
    }

    if (test.time_limit < 1) {
      setError("Time limit must be at least 1 minute");
      return false;
    }

    if (test.questions.length === 0) {
      setError("Add at least one question");
      return false;
    }

    for (let i = 0; i < test.questions.length; i++) {
      const q = test.questions[i];

      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      const validOptions = q.options.filter((opt) => opt.trim() !== "");
      if (validOptions.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      if (!q.correct_answer || !q.correct_answer.trim()) {
        setError(`Question ${i + 1} must have a correct answer selected`);
        return false;
      }

      if (!q.options.includes(q.correct_answer)) {
        setError(
          `Question ${i + 1} correct answer must match one of the options`
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateTest()) {
      return;
    }

    setSaving(true);

    try {
      // Clean up questions - remove empty options
      const cleanedQuestions = test.questions.map((q) => ({
        ...q,
        options: q.options.filter((opt) => opt.trim() !== ""),
      }));

      const response = await fetch(`${API_BASE_URL}/api/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: test.title,
          description: test.description,
          time_limit: test.time_limit,
          questions: cleanedQuestions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Test updated successfully!");
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        setError(data.message || "Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      setError("Failed to update test. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
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
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Edit Test</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={test.title}
              onChange={(e) => handleTestInfoChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={test.description}
              onChange={(e) =>
                handleTestInfoChange("description", e.target.value)
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              value={test.time_limit}
              onChange={(e) =>
                handleTestInfoChange(
                  "time_limit",
                  parseInt(e.target.value) || 1
                )
              }
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Question
            </button>
          </div>

          {test.questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-600">
                No questions yet. Add your first question!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {test.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-lg">
                      Question {qIndex + 1}
                    </h3>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "question_text",
                          e.target.value
                        )
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter question text"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options * (at least 2)
                      </label>
                      <button
                        onClick={() => addOption(qIndex)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 w-6">
                            {String.fromCharCode(65 + oIndex)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(
                              65 + oIndex
                            )}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <select
                      value={question.correct_answer}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "correct_answer",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select correct answer</option>
                      {question.options
                        .filter((opt) => opt.trim() !== "")
                        .map((option, oIndex) => (
                          <option key={oIndex} value={option}>
                            {String.fromCharCode(65 + oIndex)}. {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onBack}
            disabled={saving}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
