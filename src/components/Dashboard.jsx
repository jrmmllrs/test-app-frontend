import React, { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { NavBar } from "./ui/Navbar";
import { StatCard } from "./ui/StatCard";
import { Button } from "./ui/Button";

export default function Dashboard({ user, token, onLogout, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const endpoint =
        user?.role === "candidate"
          ? `${API_BASE_URL}/tests/available`
          : `${API_BASE_URL}/tests/my-tests`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test.question_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar title="TestGorilla" user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="User Info"
                value={user?.email}
                subtitle={`Role: ${user?.role}`}
                bgColor="bg-blue-50"
                textColor="text-blue-900"
              />

              <StatCard
                title={
                  user?.role === "candidate" ? "Available Tests" : "Tests Created"
                }
                value={tests.length}
                subtitle={user?.role === "candidate" ? "Ready to take" : "Total tests"}
                bgColor="bg-green-50"
                textColor="text-green-900"
              />

              <StatCard
                title="Questions"
                value={totalQuestions}
                subtitle="Total questions"
                bgColor="bg-purple-50"
                textColor="text-purple-900"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role === "candidate" ? "Available Tests" : "Your Tests"}
              </h3>

              {user?.role === "admin" && (
                <Button
                  onClick={() => onNavigate("admin-results")}
                  variant="primary"
                  className="mb-4 bg-yellow-500 hover:bg-yellow-600"
                >
                  View All Results
                </Button>
              )}

              {(user?.role === "employer" || user?.role === "admin") && (
                <Button
                  onClick={() => onNavigate("create-test")}
                  variant="primary"
                  icon={Plus}
                  className="mb-4"
                >
                  Create New Test
                </Button>
              )}

              {loading ? (
                <p className="text-gray-600">Loading tests...</p>
              ) : tests.length === 0 ? (
                <p className="text-gray-600">
                  {user?.role === "candidate"
                    ? "No tests available at the moment"
                    : "No tests created yet"}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      userRole={user?.role}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TestCard({ test, userRole, onNavigate }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-gray-900">{test.title}</h4>
      <p className="text-sm text-gray-600 mt-2">{test.description}</p>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          <p className="flex items-center gap-1">
            <CheckCircle size={16} className="text-green-600" />
            {test.question_count || 0} questions
          </p>
          <p className="flex items-center gap-1">
            <Clock size={16} className="text-blue-600" />
            {test.time_limit} minutes
          </p>
          {userRole === "candidate" && test.created_by_name && (
            <p className="text-xs text-gray-500 mt-1">By: {test.created_by_name}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {userRole === "employer" || userRole === "admin" ? (
            <>
              <Button
                onClick={() => onNavigate("view-test", test.id)}
                variant="ghost"
              >
                View
              </Button>
              <Button
                onClick={() =>
                  onNavigate("proctoring-events", test.id, null) // no candidate selected yet
                }
                variant="secondary"
                className="bg-red-50 text-red-700"
              >
                View Proctoring Events
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onNavigate("take-test", test.id)}
              variant="success"
            >
              Take Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
