import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useParams, useLocation } from "react-router-dom";
import bg from "../assets/desktopbg.jpg";

// Create a single socket connection instance

const Leaderboard = ({ host }) => {
  const socket = io(`${host}`);
  // State for leaderboard data and pagination
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const params = useParams();
  const { state } = useLocation();

  // Request the leaderboard whenever the params or current page changes
  useEffect(() => {
    // Build the payload with type, id (if any), and the current page number.
    const payload = { type: params.type, page: currentPage };
    if (params.id) {
      payload.id = params.id;
    }
    socket.emit("requestLeaderboard", payload);
  }, [params, currentPage]);

  // Listen for leaderboard updates from the backend
  useEffect(() => {
    const handleUpdate = (data) => {
      console.log("Received leaderboard data: ", data);
      // Assuming the backend sends { data, currentPage, totalPages, ... }
      setLeaderboard(data.data || []);
      if (data.currentPage) setCurrentPage(data.currentPage);
      if (data.totalPages) setTotalPages(data.totalPages);
    };

    socket.on("updateLeaderboard", handleUpdate);

    return () => {
      socket.off("updateLeaderboard", handleUpdate);
    };
  }, []);

  // Divide the 30 items into two columns of 15 each
  const firstColumn = leaderboard.slice(0, 15);
  const secondColumn = leaderboard.slice(15, 30);

  return (
    <div
      className="min-h-[93vh] bg-gradient-to-br from-purple-800 to-indigo-900 p-8 text-white flex flex-col items-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center">
        Leaderboard -{" "}
        {params.type.charAt(0).toUpperCase() +
          params.type.slice(1).toLowerCase()}
      </h1>
      <div className="w-full max-w-[90vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Column */}
          <div>
            {firstColumn.map((entry, index) => {
              const overallRank = index + 1;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 my-2 bg-gray-800 bg-opacity-70 rounded-lg shadow hover:shadow-xl transition duration-300"
                >
                  <div className="flex items-center">
                    <span className="text-xl font-bold mr-2">
                      {overallRank}.
                    </span>
                    {overallRank === 1 && (
                      <span className="text-2xl mr-2 pb-2">👑</span>
                    )}
                    <span className="text-lg">{entry.name}</span>
                  </div>
                  <div className="text-lg">{entry._id}</div>
                  <div className="text-lg font-semibold">
                    Score: {entry.totalPoints}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Second Column */}
          <div>
            {secondColumn.map((entry, index) => {
              const overallRank = index + 16; // second column ranks start at 16
              return (
                <div
                  key={index + 15} // ensure unique keys
                  className="flex items-center justify-between p-4 my-2 bg-gray-800 bg-opacity-70 rounded-lg shadow hover:shadow-xl transition duration-300"
                >
                  <div className="flex items-center">
                    <span className="text-xl font-bold mr-2">
                      {overallRank}.
                    </span>
                    {overallRank === 1 && (
                      <span className="text-2xl mr-2">👑</span>
                    )}
                    <span className="text-lg">{entry.name}</span>
                  </div>
                  <div className="text-lg">{entry._id}</div>
                  <div className="text-lg font-semibold">
                    Score: {entry.totalPoints}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition duration-300"
          >
            Previous
          </button>
          <span className="text-xl">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage >= totalPages}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition duration-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
