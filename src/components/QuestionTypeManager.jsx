import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

export default function QuestionTypeManager({ token, onBack }) {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    type_key: "",
    type_name: "",
    description: "",
    requires_options: false,
    requires_correct_answer: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchQuestionTypes();
  }, []);

  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setQuestionTypes(data.questionTypes);
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
      setMessage({ type: "error", text: "Failed to load question types" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.type_key || !formData.type_name) {
      setMessage({ type: "error", text: "Type key and name are required" });
      return;
    }

    try {
      const url = editingType
        ? `${API_BASE_URL}/question-types/${editingType.id}`
        : `${API_BASE_URL}/question-types`;

      const response = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: editingType
            ? "Question type updated successfully"
            : "Question type created successfully",
        });
        fetchQuestionTypes();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error saving question type:", error);
      setMessage({ type: "error", text: "Failed to save question type" });
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      type_key: type.type_key,
      type_name: type.type_name,
      description: type.description || "",
      requires_options: type.requires_options,
      requires_correct_answer: type.requires_correct_answer,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deactivate this question type?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/question-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Question type deactivated" });
        fetchQuestionTypes();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error deleting question type:", error);
      setMessage({ type: "error", text: "Failed to delete question type" });
    }
  };

  const resetForm = () => {
    setFormData({
      type_key: "",
      type_name: "",
      description: "",
      requires_options: false,
      requires_correct_answer: false,
    });
    setEditingType(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading question types...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Question Type Manager
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message.text && (
            <div
              className={`mb-4 p-4 rounded ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Question Types ({questionTypes.length})
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Question Type
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-4">
                  {editingType ? "Edit Question Type" : "New Question Type"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type Key * (lowercase, underscores only)
                    </label>
                    <input
                      type="text"
                      name="type_key"
                      value={formData.type_key}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., multiple_choice"
                      disabled={editingType !== null}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type Name *
                    </label>
                    <input
                      type="text"
                      name="type_name"
                      value={formData.type_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Multiple Choice"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe this question type..."
                    />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="requires_options"
                        checked={formData.requires_options}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Requires Options
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="requires_correct_answer"
                        checked={formData.requires_correct_answer}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Requires Correct Answer
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {editingType ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {questionTypes.map((type) => (
                <div
                  key={type.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {type.type_name}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {type.type_key}
                        </span>
                      </div>
                      {type.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {type.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>
                          Options: {type.requires_options ? "Yes" : "No"}
                        </span>
                        <span>
                          Correct Answer:{" "}
                          {type.requires_correct_answer ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
