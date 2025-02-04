import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "../assets/mobile.jpg";

function HomePage({ host }) {
  const socket = io(`${host}`);
  const [rounds, setRounds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null); // Add state for the countdown timer
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user email is already stored and redirect if not
    const userEmpId = localStorage.getItem("SbiuserEmpId");
    if (!userEmpId) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    fetchRounds();

    // Listen for real-time events from the admin panel
    socket.on(
      "questionActivated",
      ({ roundId, questionIndex, isActive, timeLimit }) => {
        setRounds((currentRounds) =>
          currentRounds.map((round) => {
            if (round._id === roundId) {
              return {
                ...round,
                questions: round.questions.map((question, idx) => ({
                  ...question,
                  isActive: idx === questionIndex,
                })),
                isActive: isActive, // set the entire round as active
              };
            }
            return round;
          })
        );

        // Start the timer for the active question
        startTimer(timeLimit);
      }
    );

    socket.on("timeUp", ({ roundNumber }) => {
      setRounds((currentRounds) =>
        currentRounds.map((round) => {
          if (round.roundNumber === roundNumber) {
            return {
              ...round,
              isActive: false,
              questions: round.questions.map((question) => ({
                ...question,
                isActive: false,
              })),
            };
          }
          return round;
        })
      );
      setTimeLeft(null); // Reset the timer when the time is up
    });

    return () => {
      socket.off("questionActivated");
      socket.off("timeUp");
    };
  }, []);

  const fetchRounds = async () => {
    try {
      const response = await axios.get(`${host}/rounds`);
      // Initialize each round's questions as inactive
      setRounds(
        response.data.map((round) => ({
          ...round,
          questions: round.questions.map((question) => ({
            ...question,
          })),
        }))
      );
    } catch (error) {
      console.error("Error fetching rounds:", error);
    }
  };

  // Function to start the countdown timer
  const startTimer = (timeLimit) => {
    let timer = timeLimit;
    setTimeLeft(timer);
    const interval = setInterval(() => {
      if (timer > 0) {
        timer--;
        setTimeLeft(timer);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div
      className="min-h-[93vh] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center py-8"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-4xl font-extrabold text-white mb-8">Quiz Rounds</h1>
      <div className="w-full max-w-3xl px-3">
        {rounds.map((round) => (
          <div
            key={round._id}
            className="bg-transparent bg-opacity-99 rounded-lg shadow-[0_4px_20px_10px_rgba(0,0,0,0.25)] mb-4 p-6 transition transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xl font-semibold">
                Round {round.roundNumber}
              </span>
              {round.isActive && (
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Active {timeLeft !== null && <span>{timeLeft}s</span>}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center">
              {round.questions.map((question, index) => (
                <button
                  key={index}
                  disabled={!question.isActive}
                  onClick={() => {
                    if (question.isActive) {
                      navigate(`/quiz`); // Redirect to question detail page
                    }
                  }}
                  className={`m-2 px-6 py-3 rounded-full font-medium transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400
                    ${
                      question.isActive
                        ? "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:scale-105"
                        : "bg-white text-gray-600 cursor-not-allowed"
                    }`}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
