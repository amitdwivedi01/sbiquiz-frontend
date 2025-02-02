import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const AdminPanel = ({ host }) => {
  const socket = io(`${host}`);
  const [rounds, setRounds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRounds();
    setupSocketListeners();
    return () => {
      socket.off("questionActivated");
      socket.off("timeUp");
    };
  }, []);

  const fetchRounds = () => {
    fetch(`${host}/rounds`)
      .then((response) => response.json())
      .then(setRounds)
      .catch((error) => console.error("Error fetching rounds:", error));
  };

  const setupSocketListeners = () => {
    socket.on("questionActivated", handleQuestionActivation);
    socket.on("timeUp", handleTimeUp);
  };

  const handleQuestionActivation = ({ roundId, questionIndex, isActive }) => {
    setRounds((currentRounds) =>
      currentRounds.map((round) =>
        round._id === roundId
          ? {
              ...round,
              isActive,
              questions: round.questions.map((question, idx) => ({
                ...question,
                isActive: idx === questionIndex,
              })),
            }
          : round
      )
    );
  };

  const handleTimeUp = ({ roundNumber, questionIndex }) => {
    setRounds((currentRounds) =>
      currentRounds.map((round) =>
        round.roundNumber === roundNumber
          ? {
              ...round,
              isActive: false,
              questions: round.questions.map((question, idx) => ({
                ...question,
                isActive: idx === questionIndex ? false : question.isActive,
              })),
            }
          : round
      )
    );
  };

  const activateQuestion = (roundNumber, questionIndex) => {
    socket.emit("activateQuestion", { roundNumber, questionIndex });
  };

  const goToLeaderboard = (type, id = "all") => {
    navigate(`/leaderboard/${type}/${id}`);
  };

  return (
    <div className="min-h-[93vh] bg-gradient-to-r from-gray-200 to-gray-400 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>
      <div className="w-full max-w-4xl">
        {rounds.map((round, idx) => (
          <div
            key={idx}
            className="mb-6 p-6 bg-white bg-opacity-90 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-semibold ${
                  round.isActive ? "text-green-600" : "text-gray-800"
                }`}
              >
                Round {round.roundNumber}
              </h2>
              {round.isActive && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {round.questions.map((question, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold shadow-md focus:outline-none transition duration-300 ${
                      question.isActive
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-blue-500 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => activateQuestion(round.roundNumber, index)}
                  >
                    Question {index + 1}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-700 shadow-md transition duration-300 focus:outline-none"
                    onClick={() => goToLeaderboard("question", question._id)}
                  >
                    Leaderboard
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 shadow-md transition duration-300 focus:outline-none"
                onClick={() => goToLeaderboard("round", round._id)}
              >
                Round Leaderboard
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-md transition duration-300 focus:outline-none"
            onClick={() => goToLeaderboard("all")}
          >
            Overall Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
