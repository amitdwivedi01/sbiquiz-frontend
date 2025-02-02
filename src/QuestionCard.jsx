import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const QuestionCard = ({ round, question, onNextQuestion }) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    socket.on("timeUp", (data) => {
      if (data.round === round && data.questionIndex === question.id) {
        alert(
          `Time for answering question ${question.id} is over. Stay tuned for new questions.`
        );
        onNextQuestion(); // Move to the next question or round
      }
    });

    return () => {
      socket.off("timeUp");
    };
  }, [round, question, onNextQuestion]);

  return (
    <div>
      <h1>{question.questionText}</h1>
      {question.options.map((option, index) => (
        <button key={index}>{option}</button>
      ))}
      <p>Time left: {timeLeft} seconds</p>
    </div>
  );
};

export default QuestionCard;
