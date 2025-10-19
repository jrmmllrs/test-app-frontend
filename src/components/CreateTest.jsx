import React, { useState, useEffect } from "react";
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
  const [questionTypes, setQuestionTypes] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch question types on component mount
  useEffect(() => {
    fetchQuestionTypes();
  }, []);

  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setQuestionTypes(data.questionTypes);
        // Set default question type to first available type
        if (data.questionTypes.length > 0) {
          const defaultType = data.questionTypes[0];
          setCurrentQuestion((prev) => ({
            ...prev,
            question_type: defaultType.type_key,
            options: defaultType.requires_options
              ? defaultType.type_key === "true_false"
                ? ["True", "False"]
                : ["", "", "", ""]
              : [],
          }));
        }
      } else {
        setMessage({ type: "error", text: "Failed to load question types" });
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
      setMessage({ type: "error", text: "Failed to load question types" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestDataChange = (e) => {
    setTestData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
    const selectedType = questionTypes.find((t) => t.type_key === type);
    let newQuestion = { ...currentQuestion, question_type: type };

    if (selectedType?.requires_options) {
      if (type === "true_false") {
        newQuestion.options = ["True", "False"];
      } else if (currentQuestion.options.length < 2) {
        newQuestion.options = ["", "", "", ""];
      }
    } else {
      newQuestion.options = [];
    }

    if (!selectedType?.requires_correct_answer) {
      newQuestion.correct_answer = "";
    }

    setCurrentQuestion(newQuestion);
  };

  const saveQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setMessage({ type: "error", text: "Question text is required" });
      return;
    }

    const selectedType = questionTypes.find(
      (t) => t.type_key === currentQuestion.question_type
    );

    if (selectedType?.requires_options) {
      const filledOptions = currentQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (filledOptions.length < 2) {
        setMessage({ type: "error", text: "At least 2 options are required" });
        return;
      }
    }

    if (
      selectedType?.requires_correct_answer &&
      !currentQuestion.correct_answer
    ) {
      setMessage({ type: "error", text: "Please select the correct answer" });
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    const defaultType = questionTypes[0];
    setCurrentQuestion({
      question_text: "",
      question_type: defaultType?.type_key || "multiple_choice",
      options: defaultType?.requires_options
        ? defaultType.type_key === "true_false"
          ? ["True", "False"]
          : ["", "", "", ""]
        : [],
      correct_answer: "",
      explanation: "",
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
    const defaultType = questionTypes[0];
    setCurrentQuestion({
      question_text: "",
      question_type: defaultType?.type_key || "multiple_choice",
      options: defaultType?.requires_options
        ? defaultType.type_key === "true_false"
          ? ["True", "False"]
          : ["", "", "", ""]
        : [],
      correct_answer: "",
      explanation: "",
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
        questions: questions.map((q) => {
          const questionType = questionTypes.find(
            (t) => t.type_key === q.question_type
          );
          return {
            ...q,
            options: questionType?.requires_options
              ? JSON.stringify(q.options.filter((opt) => opt.trim() !== ""))
              : null,
            explanation: q.explanation || null,
          };
        }),
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
        setMessage({
          type: "error",
          text: data.message || "Failed to create test",
        });
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
      setMessage({
        type: "error",
        text: "Failed to create test. Please try again.",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading question types...</div>
      </div>
    );
  }

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
                questionTypes={questionTypes}
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
                    questionTypes={questionTypes}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={saveTest}
              disabled={saving}
              icon={Save}
            >
              {saving ? "Saving..." : "Create Test"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
