import React, { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";

const CreateTest = () => {
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    time_limit: 30,
  });

  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleTestDataChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion((prev) => ({
        ...prev,
        options: newOptions,
      }));
    }
  };

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    let newQuestion = {
      ...currentQuestion,
      question_type: type,
    };

    if (type === "true_false") {
      newQuestion.options = ["True", "False"];
    } else if (
      type === "multiple_choice" &&
      currentQuestion.options.length < 2
    ) {
      newQuestion.options = ["", "", "", ""];
    } else if (type === "short_answer" || type === "coding") {
      newQuestion.options = [];
    }

    setCurrentQuestion(newQuestion);
  };

  const saveQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setMessage({ type: "error", text: "Question text is required" });
      return;
    }

    if (
      currentQuestion.question_type === "multiple_choice" ||
      currentQuestion.question_type === "true_false"
    ) {
      const filledOptions = currentQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (filledOptions.length < 2) {
        setMessage({ type: "error", text: "At least 2 options are required" });
        return;
      }
      if (!currentQuestion.correct_answer) {
        setMessage({ type: "error", text: "Please select the correct answer" });
        return;
      }
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
    });
    setShowQuestionForm(false);
    setMessage({ type: "success", text: "Question saved!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setMessage({ type: "success", text: "Question deleted!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const cancelQuestionForm = () => {
    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
    });
    setEditingIndex(null);
    setShowQuestionForm(false);
  };

  const saveTest = async () => {
    if (!testData.title.trim()) {
      setMessage({ type: "error", text: "Test title is required" });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "At least one question is required" });
      return;
    }

    setSaving(true);

    try {
      const testPayload = {
        ...testData,
        questions: questions.map((q) => ({
          ...q,
          options:
            q.question_type === "multiple_choice" ||
            q.question_type === "true_false"
              ? JSON.stringify(q.options.filter((opt) => opt.trim() !== ""))
              : null,
        })),
      };

      const response = await fetch("http://your-api-url/api/tests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Your auth token
        },
        body: JSON.stringify(testPayload),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Test created successfully!" });
        setTimeout(() => {
          // Navigate back to dashboard or test list
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create test",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: "Failed to create test. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Test
          </h1>

          {message.text && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Title *
              </label>
              <input
                type="text"
                name="title"
                value={testData.title}
                onChange={handleTestDataChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., JavaScript Developer Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={testData.description}
                onChange={handleTestDataChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what this test covers..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                name="time_limit"
                value={testData.time_limit}
                onChange={handleTestDataChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Questions ({questions.length})
            </h2>
            {!showQuestionForm && (
              <button
                onClick={() => setShowQuestionForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={20} />
                Add Question
              </button>
            )}
          </div>

          {showQuestionForm && (
            <div className="border-2 border-indigo-200 rounded-lg p-6 mb-6 bg-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingIndex !== null ? "Edit Question" : "New Question"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    value={currentQuestion.question_type}
                    onChange={handleQuestionTypeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    name="question_text"
                    value={currentQuestion.question_text}
                    onChange={handleQuestionChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your question..."
                  />
                </div>

                {(currentQuestion.question_type === "multiple_choice" ||
                  currentQuestion.question_type === "true_false") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder={`Option ${index + 1}`}
                            readOnly={
                              currentQuestion.question_type === "true_false"
                            }
                          />
                          {currentQuestion.question_type ===
                            "multiple_choice" &&
                            currentQuestion.options.length > 2 && (
                              <button
                                onClick={() => removeOption(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                        </div>
                      ))}
                      {currentQuestion.question_type === "multiple_choice" && (
                        <button
                          onClick={addOption}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <select
                        name="correct_answer"
                        value={currentQuestion.correct_answer}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options.map(
                          (option, index) =>
                            option.trim() && (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </div>
                )}

                {(currentQuestion.question_type === "short_answer" ||
                  currentQuestion.question_type === "coding") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Answer / Keywords
                    </label>
                    <textarea
                      name="correct_answer"
                      value={currentQuestion.correct_answer}
                      onChange={handleQuestionChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter expected answer or keywords for evaluation..."
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    onClick={cancelQuestionForm}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                  <button
                    onClick={saveQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save size={20} />
                    {editingIndex !== null ? "Update" : "Save"} Question
                  </button>
                </div>
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {question.question_type
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">
                        {question.question_text}
                      </p>

                      {(question.question_type === "multiple_choice" ||
                        question.question_type === "true_false") && (
                        <div className="ml-4 space-y-1">
                          {question.options
                            .filter((opt) => opt.trim())
                            .map((option, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span
                                  className={`text-sm ${
                                    option === question.correct_answer
                                      ? "text-green-600 font-semibold"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {option === question.correct_answer && "✓ "}
                                  {option}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editQuestion(index)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveTest}
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Create Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
