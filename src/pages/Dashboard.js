import { useState, useEffect, useRef, useMemo } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const userId = auth.currentUser?.uid;

  // TIMER LOGIC
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // LOAD SESSIONS
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!userId) return;

    const q = query(collection(db, "sessions"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setSessions(data);
  };

  // SAVE SESSION
  const saveSession = async () => {
    if (!userId) return;

    await addDoc(collection(db, "sessions"), {
      userId,
      duration: 1500 - seconds,
      date: new Date().toLocaleString()
    });

    loadSessions();
  };

  // AUTO SAVE WHEN TIMER ENDS
  useEffect(() => {
    if (seconds <= 0 && isRunning) {
      setIsRunning(false);
      saveSession();
      setSeconds(1500);
    }
  }, [seconds]);

  // TOTAL TIME
  const totalTime = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.duration, 0);
  }, [sessions]);

  // LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // FORMAT TIMER
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Digital Detox</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* TIMER CARD */}
      <div className="bg-gray-800 p-6 rounded-lg text-center mb-6">
        <h2 className="text-xl mb-4">Focus Timer</h2>

        <div className="text-6xl mb-4 font-mono">
          {formatTime()}
        </div>

        <div className="space-x-3">
          <button
            onClick={() => setIsRunning(true)}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Start
          </button>

          <button
            onClick={() => setIsRunning(false)}
            className="bg-yellow-500 px-4 py-2 rounded"
          >
            Pause
          </button>

          <button
            onClick={() => {
              setSeconds(1500);
              setIsRunning(false);
            }}
            className="bg-gray-500 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* TOTAL TIME */}
      <div className="bg-gray-800 p-4 rounded mb-6 text-center">
        <h2 className="text-lg">
          Total Focus Time:{" "}
          <span className="font-bold text-green-400">
            {Math.floor(totalTime / 60)} mins
          </span>
        </h2>
      </div>

      {/* SESSION HISTORY */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl mb-4">Session History</h2>

        {sessions.length === 0 ? (
          <p className="text-gray-400">No sessions yet</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="border-b border-gray-700 pb-2"
              >
                ⏱ {session.duration} sec — {session.date}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;