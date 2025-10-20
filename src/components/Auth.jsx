import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    department_id: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments when component mounts or when switching to registration
  useEffect(() => {
    if (!isLogin) {
      fetchDepartments();
    }
  }, [isLogin]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/departments`);
      const data = await response.json();

      if (data.success) {
        setDepartments(data.departments);
      } else {
        console.error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // If role changes to non-candidate, clear department
      if (name === "role" && value !== "candidate") {
        updated.department_id = "";
      }

      return updated;
    });
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }

      if (formData.role === "candidate" && !formData.department_id) {
        setError("Department is required for candidates");
        return false;
      }
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }

    if (!isLogin && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            department_id:
              formData.role === "candidate" ? formData.department_id : null,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        "Connection error. Make sure backend is running on localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "candidate",
      department_id: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TestGorilla</h1>
          <p className="text-gray-600">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert type="error" message={error} />

          {!isLogin && (
            <>
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="John Doe"
              />

              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required={!isLogin}
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
              </Select>

              {formData.role === "candidate" && (
                <div>
                  <Select
                    label="Department"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    required={formData.role === "candidate"}
                    disabled={loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select your department"}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    You will only see tests for your department
                  </p>
                </div>
              )}
            </>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            minLength={isLogin ? undefined : 6}
          />

          {!isLogin && (
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || (loadingDepartments && !isLogin)}
            className="w-full"
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
