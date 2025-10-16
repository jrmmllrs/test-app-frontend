// import React, { useState, useEffect } from "react";
// import { Plus, Trash2, Save, X, ArrowLeft, LogOut, Clock, CheckCircle } from 'lucide-react';

// const API_BASE_URL = 'http://localhost:5000/api';

// // Auth Component
// const Auth = ({ onAuthSuccess }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'candidate'
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const endpoint = isLogin ? '/auth/login' : '/auth/register';
//       const payload = isLogin 
//         ? { email: formData.email, password: formData.password }
//         : formData;

//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (!data.success) {
//         setError(data.message || 'Authentication failed');
//         return;
//       }

//       // Store token in memory instead of localStorage
//       onAuthSuccess(data.user, data.token);
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//       setError('Connection error. Make sure backend is running on localhost:5000');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
//           TestGorilla
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {!isLogin && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required={!isLogin}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="candidate">Candidate</option>
//                   <option value="employer">Employer</option>
//                 </select>
//               </div>
//             </>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               placeholder="••••••••"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400"
//           >
//             {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
//           </button>
//         </form>

//         <button
//           onClick={() => {
//             setIsLogin(!isLogin);
//             setError('');
//             setFormData({ name: '', email: '', password: '', role: 'candidate' });
//           }}
//           className="w-full mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
//         >
//           {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
//         </button>
//       </div>
//     </div>
//   );
// };

// // Dashboard Component
// const Dashboard = ({ user, token, onLogout, onNavigate }) => {
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchTests();
//   }, []);

//   const fetchTests = async () => {
//     try {
//       const endpoint = user?.role === 'candidate' 
//         ? `${API_BASE_URL}/tests/available`
//         : `${API_BASE_URL}/tests/my-tests`;
      
//       const response = await fetch(endpoint, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (data.success) {
//         setTests(data.tests);
//       }
//     } catch (err) {
//       console.error('Error fetching tests:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-bold text-gray-800">TestGorilla</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="text-gray-700">
//                 Welcome, <span className="font-semibold">{user?.name}</span>
//               </span>
//               <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                 {user?.role}
//               </span>
//               <button
//                 onClick={onLogout}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
//               >
//                 <LogOut size={16} />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="px-4 py-6 sm:px-0">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-blue-50 p-6 rounded-lg">
//                 <h3 className="text-lg font-semibold text-blue-900">User Info</h3>
//                 <p className="text-blue-700 mt-2">Email: {user?.email}</p>
//                 <p className="text-blue-700">Role: {user?.role}</p>
//               </div>

//               <div className="bg-green-50 p-6 rounded-lg">
//                 <h3 className="text-lg font-semibold text-green-900">
//                   {user?.role === 'candidate' ? 'Available Tests' : 'Tests Created'}
//                 </h3>
//                 <p className="text-green-700 mt-2 text-3xl font-bold">{tests.length}</p>
//                 <p className="text-green-600 text-sm">
//                   {user?.role === 'candidate' ? 'Ready to take' : 'Total tests'}
//                 </p>
//               </div>

//               <div className="bg-purple-50 p-6 rounded-lg">
//                 <h3 className="text-lg font-semibold text-purple-900">Questions</h3>
//                 <p className="text-purple-700 mt-2 text-3xl font-bold">
//                   {tests.reduce((sum, test) => sum + (test.question_count || 0), 0)}
//                 </p>
//                 <p className="text-purple-600 text-sm">Total questions</p>
//               </div>
//             </div>

//             <div className="mt-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 {user?.role === 'candidate' ? 'Available Tests' : 'Your Tests'}
//               </h3>
              
//               {(user?.role === 'employer' || user?.role === 'admin') && (
//                 <button
//                   onClick={() => onNavigate('create-test')}
//                   className="flex items-center gap-2 px-4 py-2 mb-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
//                 >
//                   <Plus size={20} />
//                   Create New Test
//                 </button>
//               )}

//               {loading ? (
//                 <p className="text-gray-600">Loading tests...</p>
//               ) : tests.length === 0 ? (
//                 <p className="text-gray-600">
//                   {user?.role === 'candidate' 
//                     ? 'No tests available at the moment' 
//                     : 'No tests created yet'}
//                 </p>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {tests.map(test => (
//                     <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                       <h4 className="font-semibold text-gray-900">{test.title}</h4>
//                       <p className="text-sm text-gray-600 mt-2">{test.description}</p>
//                       <div className="flex justify-between items-center mt-4">
//                         <div className="text-sm text-gray-600">
//                           <p className="flex items-center gap-1">
//                             <CheckCircle size={16} className="text-green-600" />
//                             {test.question_count || 0} questions
//                           </p>
//                           <p className="flex items-center gap-1">
//                             <Clock size={16} className="text-blue-600" />
//                             {test.time_limit} minutes
//                           </p>
//                           {user?.role === 'candidate' && test.created_by_name && (
//                             <p className="text-xs text-gray-500 mt-1">By: {test.created_by_name}</p>
//                           )}
//                         </div>
//                         {user?.role === 'employer' || user?.role === 'admin' ? (
//                           <button
//                             onClick={() => onNavigate('view-test', test.id)}
//                             className="px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium"
//                           >
//                             View
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => onNavigate('take-test', test.id)}
//                             className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium"
//                           >
//                             Take Test
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// // Take Test Component
// const TakeTest = ({ token, testId, onBack }) => {
//   const [test, setTest] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     fetchTest();
//   }, [testId]);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && test) {
//       handleSubmit();
//     }
//   }, [timeLeft]);

//   const fetchTest = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/tests/${testId}/take`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (data.success) {
//         setTest(data.test);
//         setTimeLeft(data.test.time_limit * 60);
//       } else {
//         setMessage({ type: 'error', text: data.message });
//       }
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//       setMessage({ type: 'error', text: 'Failed to load test' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswerChange = (questionId, answer) => {
//     setAnswers(prev => ({ ...prev, [questionId]: answer }));
//   };

//   const handleSubmit = async () => {
//     if (submitting) return;
    
//     setSubmitting(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ answers })
//       });

//       const data = await response.json();
//       if (data.success) {
//         setMessage({ type: 'success', text: `Test submitted! Score: ${data.submission.score}%` });
//         setTimeout(() => onBack(), 3000);
//       } else {
//         setMessage({ type: 'error', text: data.message });
//         setSubmitting(false);
//       }
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//       setMessage({ type: 'error', text: 'Failed to submit test' });
//       setSubmitting(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-gray-600">Loading test...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-lg sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center gap-4">
//               <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
//                 <ArrowLeft size={24} />
//               </button>
//               <h1 className="text-xl font-bold text-gray-800">{test?.title}</h1>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
//                 <Clock size={20} className="text-red-600" />
//                 <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="py-8 px-4">
//         <div className="max-w-4xl mx-auto">
//           {message.text && (
//             <div className={`mb-4 p-4 rounded-lg ${
//               message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {message.text}
//             </div>
//           )}

//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <p className="text-gray-600 mb-4">{test?.description}</p>
//             <div className="flex gap-4 text-sm text-gray-600">
//               <span>Questions: {test?.questions?.length}</span>
//               <span>Time: {test?.time_limit} minutes</span>
//             </div>
//           </div>

//           {test?.questions?.map((question, index) => (
//             <div key={question.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
//               <div className="flex items-start gap-3 mb-4">
//                 <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded">
//                   Q{index + 1}
//                 </span>
//                 <p className="text-gray-900 font-medium flex-1">{question.question_text}</p>
//               </div>

//               {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
//                 <div className="space-y-2 ml-12">
//                   {question.options.map((option, i) => (
//                     <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
//                       <input
//                         type="radio"
//                         name={`question-${question.id}`}
//                         value={option}
//                         checked={answers[question.id] === option}
//                         onChange={(e) => handleAnswerChange(question.id, e.target.value)}
//                         className="w-4 h-4 text-indigo-600"
//                       />
//                       <span className="text-gray-700">{option}</span>
//                     </label>
//                   ))}
//                 </div>
//               )}

//               {question.question_type === 'short_answer' && (
//                 <textarea
//                   value={answers[question.id] || ''}
//                   onChange={(e) => handleAnswerChange(question.id, e.target.value)}
//                   className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   rows="3"
//                   placeholder="Type your answer here..."
//                 />
//               )}

//               {question.question_type === 'coding' && (
//                 <textarea
//                   value={answers[question.id] || ''}
//                   onChange={(e) => handleAnswerChange(question.id, e.target.value)}
//                   className="w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
//                   rows="6"
//                   placeholder="Write your code here..."
//                 />
//               )}
//             </div>
//           ))}

//           <div className="flex justify-end">
//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
//             >
//               {submitting ? 'Submitting...' : 'Submit Test'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Create Test Component
// const CreateTest = ({ user, token, onBack }) => {
//   const [testData, setTestData] = useState({
//     title: '',
//     description: '',
//     time_limit: 30
//   });

//   const [questions, setQuestions] = useState([]);
//   const [showQuestionForm, setShowQuestionForm] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState({
//     question_text: '',
//     question_type: 'multiple_choice',
//     options: ['', '', '', ''],
//     correct_answer: ''
//   });
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const handleTestDataChange = (e) => {
//     const { name, value } = e.target;
//     setTestData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleQuestionChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentQuestion(prev => ({ ...prev, [name]: value }));
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...currentQuestion.options];
//     newOptions[index] = value;
//     setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
//   };

//   const addOption = () => {
//     setCurrentQuestion(prev => ({
//       ...prev,
//       options: [...prev.options, '']
//     }));
//   };

//   const removeOption = (index) => {
//     if (currentQuestion.options.length > 2) {
//       const newOptions = currentQuestion.options.filter((_, i) => i !== index);
//       setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
//     }
//   };

//   const handleQuestionTypeChange = (e) => {
//     const type = e.target.value;
//     let newQuestion = { ...currentQuestion, question_type: type };

//     if (type === 'true_false') {
//       newQuestion.options = ['True', 'False'];
//     } else if (type === 'multiple_choice' && currentQuestion.options.length < 2) {
//       newQuestion.options = ['', '', '', ''];
//     } else if (type === 'short_answer' || type === 'coding') {
//       newQuestion.options = [];
//     }

//     setCurrentQuestion(newQuestion);
//   };

//   const saveQuestion = () => {
//     if (!currentQuestion.question_text.trim()) {
//       setMessage({ type: 'error', text: 'Question text is required' });
//       return;
//     }

//     if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') {
//       const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
//       if (filledOptions.length < 2) {
//         setMessage({ type: 'error', text: 'At least 2 options are required' });
//         return;
//       }
//       if (!currentQuestion.correct_answer) {
//         setMessage({ type: 'error', text: 'Please select the correct answer' });
//         return;
//       }
//     }

//     if (editingIndex !== null) {
//       const updatedQuestions = [...questions];
//       updatedQuestions[editingIndex] = currentQuestion;
//       setQuestions(updatedQuestions);
//       setEditingIndex(null);
//     } else {
//       setQuestions([...questions, currentQuestion]);
//     }

//     setCurrentQuestion({
//       question_text: '',
//       question_type: 'multiple_choice',
//       options: ['', '', '', ''],
//       correct_answer: ''
//     });
//     setShowQuestionForm(false);
//     setMessage({ type: 'success', text: 'Question saved!' });
//     setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//   };

//   const editQuestion = (index) => {
//     setCurrentQuestion(questions[index]);
//     setEditingIndex(index);
//     setShowQuestionForm(true);
//   };

//   const deleteQuestion = (index) => {
//     setQuestions(questions.filter((_, i) => i !== index));
//     setMessage({ type: 'success', text: 'Question deleted!' });
//     setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//   };

//   const cancelQuestionForm = () => {
//     setCurrentQuestion({
//       question_text: '',
//       question_type: 'multiple_choice',
//       options: ['', '', '', ''],
//       correct_answer: ''
//     });
//     setEditingIndex(null);
//     setShowQuestionForm(false);
//   };

//   const saveTest = async () => {
//     if (!testData.title.trim()) {
//       setMessage({ type: 'error', text: 'Test title is required' });
//       return;
//     }

//     if (questions.length === 0) {
//       setMessage({ type: 'error', text: 'At least one question is required' });
//       return;
//     }

//     setSaving(true);

//     try {
//       const testPayload = {
//         ...testData,
//         questions: questions.map(q => ({
//           ...q,
//           options: (q.question_type === 'multiple_choice' || q.question_type === 'true_false')
//             ? JSON.stringify(q.options.filter(opt => opt.trim() !== ''))
//             : null
//         }))
//       };

//       const response = await fetch(`${API_BASE_URL}/tests/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(testPayload)
//       });

//       const data = await response.json();

//       if (!data.success) {
//         setMessage({ type: 'error', text: data.message || 'Failed to create test' });
//         setSaving(false);
//         return;
//       }

//       setMessage({ type: 'success', text: 'Test created successfully!' });

//       setTimeout(() => {
//         setTestData({ title: '', description: '', time_limit: 30 });
//         setQuestions([]);
//         setMessage({ type: '', text: '' });
//         onBack();
//       }, 2000);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessage({ type: 'error', text: 'Failed to create test. Please try again.' });
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center gap-4">
//               <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
//                 <ArrowLeft size={24} />
//               </button>
//               <h1 className="text-xl font-bold text-gray-800">Create New Test</h1>
//             </div>
//             <div className="flex items-center">
//               <span className="text-gray-700">{user?.name}</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="py-8 px-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             {message.text && (
//               <div className={`mb-4 p-4 rounded-lg ${
//                 message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//               }`}>
//                 {message.text}
//               </div>
//             )}

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Test Title *</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={testData.title}
//                   onChange={handleTestDataChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="e.g., JavaScript Developer Assessment"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                 <textarea
//                   name="description"
//                   value={testData.description}
//                   onChange={handleTestDataChange}
//                   rows="4"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="Describe what this test covers..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
//                 <input
//                   type="number"
//                   name="time_limit"
//                   value={testData.time_limit}
//                   onChange={handleTestDataChange}
//                   min="1"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold text-gray-900">Questions ({questions.length})</h2>
//               {!showQuestionForm && (
//                 <button
//                   onClick={() => setShowQuestionForm(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                 >
//                   <Plus size={20} />
//                   Add Question
//                 </button>
//               )}
//             </div>

//             {showQuestionForm && (
//               <div className="border-2 border-indigo-200 rounded-lg p-6 mb-6 bg-indigo-50">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   {editingIndex !== null ? 'Edit Question' : 'New Question'}
//                 </h3>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
//                     <select
//                       value={currentQuestion.question_type}
//                       onChange={handleQuestionTypeChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="multiple_choice">Multiple Choice</option>
//                       <option value="true_false">True/False</option>
//                       <option value="short_answer">Short Answer</option>
//                       <option value="coding">Coding</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
//                     <textarea
//                       name="question_text"
//                       value={currentQuestion.question_text}
//                       onChange={handleQuestionChange}
//                       rows="3"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter your question..."
//                     />
//                   </div>

//                   {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
//                       <div className="space-y-2">
//                         {currentQuestion.options.map((option, index) => (
//                           <div key={index} className="flex gap-2 items-center">
//                             <input
//                               type="text"
//                               value={option}
//                               onChange={(e) => handleOptionChange(index, e.target.value)}
//                               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                               placeholder={`Option ${index + 1}`}
//                               readOnly={currentQuestion.question_type === 'true_false'}
//                             />
//                             {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options.length > 2 && (
//                               <button
//                                 onClick={() => removeOption(index)}
//                                 className="p-2 text-red-600 hover:bg-red-50 rounded"
//                               >
//                                 <Trash2 size={20} />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                         {currentQuestion.question_type === 'multiple_choice' && (
//                           <button
//                             onClick={addOption}
//                             className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
//                           >
//                             + Add Option
//                           </button>
//                         )}
//                       </div>

//                       <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
//                         <select
//                           name="correct_answer"
//                           value={currentQuestion.correct_answer}
//                           onChange={handleQuestionChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         >
//                           <option value="">Select correct answer</option>
//                           {currentQuestion.options.map((option, index) => (
//                             option.trim() && (
//                               <option key={index} value={option}>
//                                 {option}
//                               </option>
//                             )
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   )}

//                   {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'coding') && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Expected Answer / Keywords</label>
//                       <textarea
//                         name="correct_answer"
//                         value={currentQuestion.correct_answer}
//                         onChange={handleQuestionChange}
//                         rows="3"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Enter expected answer or keywords for evaluation..."
//                       />
//                     </div>
//                   )}

//                   <div className="flex gap-2 justify-end pt-4">
//                     <button
//                       onClick={cancelQuestionForm}
//                       className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                     >
//                       <X size={20} />
//                       Cancel
//                     </button>
//                     <button
//                       onClick={saveQuestion}
//                       className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                     >
//                       <Save size={20} />
//                       {editingIndex !== null ? 'Update' : 'Save'} Question
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {questions.length > 0 && (
//               <div className="space-y-3">
//                 {questions.map((question, index) => (
//                   <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex justify-between items-start mb-2">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
//                             Q{index + 1}
//                           </span>
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                             {question.question_type.replace('_', ' ').toUpperCase()}
//                           </span>
//                         </div>
//                         <p className="text-gray-900 font-medium mb-2">{question.question_text}</p>

//                         {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
//                           <div className="ml-4 space-y-1">
//                             {question.options.filter(opt => opt.trim()).map((option, i) => (
//                               <div key={i} className="flex items-center gap-2">
//                                 <span className={`text-sm ${
//                                   option === question.correct_answer ? 'text-green-600 font-semibold' : 'text-gray-600'
//                                 }`}>
//                                   {option === question.correct_answer && '✓ '}
//                                   {option}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => editQuestion(index)}
//                           className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => deleteQuestion(index)}
//                           className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-4">
//             <button
//               onClick={onBack}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={saveTest}
//               disabled={saving}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               <Save size={20} />
//               {saving ? 'Saving...' : 'Create Test'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main App
// export default function App() {
//   const [currentView, setCurrentView] = useState('auth');
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [selectedTestId, setSelectedTestId] = useState(null);

//   const handleAuthSuccess = (userData, authToken) => {
//     setUser(userData);
//     setToken(authToken);
//     setCurrentView('dashboard');
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setToken(null);
//     setSelectedTestId(null);
//     setCurrentView('auth');
//   };

//   const handleNavigate = (view, testId = null) => {
//     setCurrentView(view);
//     setSelectedTestId(testId);
//   };

//   return (
//     <>
//       {currentView === 'auth' && (
//         <Auth onAuthSuccess={handleAuthSuccess} />
//       )}
//       {currentView === 'dashboard' && (
//         <Dashboard
//           user={user}
//           token={token}
//           onLogout={handleLogout}
//           onNavigate={handleNavigate}
//         />
//       )}
//       {currentView === 'create-test' && (
//         <CreateTest
//           user={user}
//           token={token}
//           onBack={() => handleNavigate('dashboard')}
//         />
//       )}
//       {currentView === 'take-test' && (
//         <TakeTest
//           user={user}
//           token={token}
//           testId={selectedTestId}
//           onBack={() => handleNavigate('dashboard')}
//         />
//       )}
//     </>
//   );
// }