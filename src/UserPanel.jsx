import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import bg from "./assets/mobilequiz.jpg";

const UserPanel = ({ host }) => {
  const socket = io(`${host}`);
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user email is already stored and redirect if not
    const userEmail = localStorage.getItem("SbiuserEmail");
    if (!userEmail) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchActiveQuestion();

    socket.on("questionActivated", ({ question, timeLimit }) => {
      setQuestion(question);
      // We are no longer displaying the time left
    });

    socket.on("timeUp", () => {
      toast.error("Time's up! Stay tuned for the next question.");
      setQuestion(null);
      setTimeout(() => navigate("/home"), 2000);
    });

    return () => {
      socket.off("questionActivated");
      socket.off("timeUp");
    };
  }, [navigate]);

  const fetchActiveQuestion = () => {
    axios
      .get(`${host}/api/response/active-question`)
      .then((response) => {
        setQuestion(response.data);
      })
      .catch((error) => {
        toast.error("Could not load active question.");
      });
  };

  const handleAnswer = (option) => {
    const userEmail = localStorage.getItem("SbiuserEmail");
    const userName = localStorage.getItem("SbiuserName");

    if (!userEmail) {
      toast.error("User email not found. Please log in again.");
      navigate("/login");
      return;
    }

    axios
      .post(`${host}/api/response/submit-answer`, {
        questionId: question._id,
        answer: option,
        userEmail,
        userName,
      })
      .then((response) => {
        toast.success("Thank you for your response!");
        setTimeout(() => navigate("/home"), 3000);
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          toast.error(
            error.response.data.message ||
              "You have already submitted a response for this question."
          );
          setTimeout(() => navigate("/home"), 2000);
        } else {
          console.error("Error submitting answer:", error);
          toast.error(
            error.response?.data?.message ||
              "Failed to submit answer, please try again."
          );
          setTimeout(() => navigate("/home"), 2000);
        }
      });
  };

  return (
    <div
      className="min-h-[93vh] bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex justify-center items-center px-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-lg mt-15">
        {question ? (
          <div className="bg-tranparent bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              {question.questionText}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-tranparent bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg text-center">
            <p className="text-xl text-gray-200 font-medium">
              No active question. Please wait...
            </p>
          </div>
        )}
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
};

export default UserPanel;
