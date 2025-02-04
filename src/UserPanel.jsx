import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "./assets/mobilequiz.jpg";
import toast from "react-hot-toast";

const UserPanel = ({ host }) => {
  const socket = io(`${host}`);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null); // State to store the remaining time
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user email is already stored and redirect if not
    const userEmpId = localStorage.getItem("SbiuserEmpId");
    if (!userEmpId) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchActiveQuestion();

    socket.on("questionActivated", ({ question, timeLimit }) => {
      setQuestion(question);
      setRemainingTime(timeLimit); // Set the initial time limit for the question
    });

    socket.on("updateTimer", ({ remainingTime }) => {
      setRemainingTime(remainingTime); // Update the remaining time every second
    });

    socket.on("timeUp", () => {
      toast.error("Time's up! Stay tuned for the next question.");
      setQuestion(null);
      setTimeout(() => navigate("/home"), 2000);
    });

    return () => {
      socket.off("questionActivated");
      socket.off("updateTimer");
      socket.off("timeUp");
    };
  }, [navigate]);

  const fetchActiveQuestion = () => {
    axios
      .get(`${host}/api/response/active-question`)
      .then((response) => {
        setQuestion(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error("Could not load active question.");
      });
  };

  const handleAnswer = (option) => {
    setSelectedOption(option);
    const userEmpId = localStorage.getItem("SbiuserEmpId");
    const userName = localStorage.getItem("SbiuserName");

    if (!userEmpId) {
      toast.error("User employee Id not found. Please log in again.");
      navigate("/login");
      return;
    }

    // Calculate time taken (assuming timer starts at 15 seconds)
    const timeTaken = 15 - (remainingTime || 0); // Ensure remainingTime is not null

    axios
      .post(`${host}/api/response/submit-answer`, {
        questionId: question._id,
        answer: option,
        userEmpId,
        userName,
        timeTaken, // Send calculated time taken
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
      className="min-h-[93vh] bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex flex-col "
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-end w-full p-2">
        {remainingTime !== null && (
          <span className=" bg-gradient-to-br from-blue-500 to-pink-500 text-lg text-white font-semibold  rounded-full px-4 py-2">
            {remainingTime}s
          </span>
        )}
      </div>

      <div className="w-full max-w-lg mt-44  px-4">
        {question ? (
          <div className="bg-gradient-to-r from-[#d12056] to-[#532c6d] p-8 rounded-lg shadow-[0_8px_20px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {question.questionText}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`bg-blue-500 hover:bg-blue-800 transition duration-300 ease-in-out text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none ${
                    selectedOption === option && " bg-blue-800"
                  } `}
                >
                  {selectedOption === option ? (
                    <div className="flex justify-center">
                      <span className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full"></span>
                    </div>
                  ) : (
                    option
                  )}
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
    </div>
  );
};

export default UserPanel;
