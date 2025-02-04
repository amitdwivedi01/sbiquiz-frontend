import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "../assets/mobile.jpg";
import toast from "react-hot-toast";

function AuthForm({ host }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    department: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user email is already stored and redirect
    const userEmpId = localStorage.getItem("SbiuserEmpId");
    if (userEmpId) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = `${host}/api/auth/${isLogin ? "login" : "register"}`;

    try {
      const response = await axios.post(url, formData);
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("SbiuserEmpId", response.data.user.employeeId);
        localStorage.setItem("SbiuserName", response.data.user.name);
        toast.success(`Successfully ${isLogin ? "logged in" : "registered"}.`);
        navigate("/home");
      } else {
        toast.error(
          `Problem ${
            isLogin ? "logging in" : "registering"
          }, please try again later.`
        );
      }
    } catch (error) {
      console.error("Error:", error.response.data);
      toast.error(`Error: ${error.response.data}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset all form fields when toggling between forms
    setFormData({ name: "", employeeId: "", department: "" });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md p-8 bg-tranparent bg-opacity-100 rounded-lg shadow-[0_8px_20px_10px_rgba(0,0,0,0.25)] mb-10">
        <h3 className="text-2xl font-bold text-center text-gray-200 mb-6">
          {isLogin ? "Login" : "Register"}
        </h3>
        <form onSubmit={submitForm}>
          {!isLogin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Your Name"
                id="name"
                name="name"
                onChange={handleChange}
                value={formData.name}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 bg-white bg-opacity-80"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter Your Employee code"
              id="employeeId"
              name="employeeId"
              onChange={handleChange}
              value={formData.employeeId}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 bg-white bg-opacity-80"
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Your Department"
                id="department"
                name="department"
                onChange={handleChange}
                value={formData.department}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 bg-white bg-opacity-80"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-800 focus:outline-none  "
          >
            {loading ? (
              <div className="flex justify-center">
                <span className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full"></span>
              </div>
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>

          <p className="mt-5 text-center font-bold text-sm text-gray-200">
            {isLogin ? "New User? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleForm}
              className="text-blue-600 hover:text-red-800 font-medium"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;
