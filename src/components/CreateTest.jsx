import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { NavBar } from "./ui/Navbar";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TextArea } from "./ui/TextArea";
import QuestionForm from "./QuestionForm";
import QuestionPreview from "./QuestionPreview";

export default function CreateTest({ user, token, onBack }) {
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
    explanation: "", // ADDED: explanation field
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleTestDataChange = (e) => {
    setTestData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
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
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    let newQuestion = { ...currentQuestion, question_type: type };

    if (type === "true_false") {
      newQuestion.options = ["True", "False"];
    } else if (type === "multiple_choice" && currentQuestion.options.length < 2) {
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
      const filledOptions = currentQuestion.options.filter((opt) => opt.trim() !== "");
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
      explanation: "", // ADDED: reset explanation
    });
    setShowQuestionForm(false);
    setMessage({ type: "success", text: "Question saved!" });
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setMessage({ type: "success", text: "Question deleted!" });
  };

  const cancelQuestionForm = () => {
    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "", // ADDED: reset explanation
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
            q.question_type === "multiple_choice" || q.question_type === "true_false"
              ? JSON.stringify(q.options.filter((opt) => opt.trim() !== ""))
              : null,
          explanation: q.explanation || null, // ADDED: include explanation
        })),
      };

      const response = await fetch(`${API_BASE_URL}/tests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testPayload),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({ type: "error", text: data.message || "Failed to create test" });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Test created successfully!" });

      setTimeout(() => {
        setTestData({ title: "", description: "", time_limit: 30 });
        setQuestions([]);
        setMessage({ type: "", text: "" });
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Failed to create test. Please try again." });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Create New Test" user={user} onBack={onBack} />

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: "", text: "" })}
            />

            <div className="space-y-4">
              <Input
                label="Test Title *"
                type="text"
                name="title"
                value={testData.title}
                onChange={handleTestDataChange}
                placeholder="e.g., JavaScript Developer Assessment"
              />

              <TextArea
                label="Description"
                name="description"
                value={testData.description}
                onChange={handleTestDataChange}
                rows="4"
                placeholder="Describe what this test covers..."
              />

              <Input
                label="Time Limit (minutes)"
                type="number"
                name="time_limit"
                value={testData.time_limit}
                onChange={handleTestDataChange}
                min="1"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Questions ({questions.length})
              </h2>
              {!showQuestionForm && (
                <Button onClick={() => setShowQuestionForm(true)} icon={Plus}>
                  Add Question
                </Button>
              )}
            </div>

            {showQuestionForm && (
              <QuestionForm
                currentQuestion={currentQuestion}
                editingIndex={editingIndex}
                onQuestionChange={handleQuestionChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                onOptionChange={handleOptionChange}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onSave={saveQuestion}
                onCancel={cancelQuestionForm}
              />
            )}

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionPreview
                    key={index}
                    question={question}
                    index={index}
                    onEdit={() => editQuestion(index)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="success" onClick={saveTest} disabled={saving} icon={Save}>
              {saving ? "Saving..." : "Create Test"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}