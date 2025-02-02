import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import bg from "../assets/mobilebg.jpg";

function AuthForm({ host }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user email is already stored and redirect
    const userEmail = localStorage.getItem("SbiuserEmail");
    if (userEmail) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const url = `${host}/api/auth/${isLogin ? "login" : "register"}`;

    try {
      const response = await axios.post(url, formData);
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("SbiuserEmail", response.data.user.email);
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
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset all form fields when toggling between forms
    setFormData({ name: "", email: "", phone: "", department: "" });
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
      <div className="w-full max-w-md p-8 bg-tranparent bg-opacity-90 rounded-lg shadow-lg mb-10">
        <h3 className="text-2xl font-bold text-center text-gray-200 mb-6">
          {isLogin ? "Login" : "Register"}
        </h3>
        <form onSubmit={submitForm}>
          {!isLogin && (
            <>
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
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter Your Employee Code"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  value={formData.phone}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 bg-white bg-opacity-80"
                  required
                />
              </div>
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
            </>
          )}
          <div className="mb-6">
            <input
              type="email"
              placeholder="Enter Your Email"
              id="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 bg-white bg-opacity-80"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition duration-300"
          >
            {isLogin ? "Login" : "Register"}
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
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default AuthForm;
