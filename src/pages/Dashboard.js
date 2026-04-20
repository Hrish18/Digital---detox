import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const loadSessions = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "sessions"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSessions(data);
  }, []);

  const saveSession = useCallback(async () => {
    try {
      await addDoc(collection(db, "sessions"), {
        duration: Math.floor((1500 - seconds) / 60),
        date: new Date().toLocaleString(),
      });

      loadSessions();
      setSeconds(1500);
    } catch (err) {
      console.error(err);
    }
  }, [seconds, loadSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    let timer;

    if (isRunning && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (seconds <= 0 && isRunning) {
      saveSession();
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, seconds, saveSession]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Digital Detox</h1>

        <button
          onClick={handleLogout}
          className="bg-yellow-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg text-center mb-6">
        <h2 className="text-xl mb-4">Focus Timer</h2>
        <div className="text-6xl mb-4">{formatTime()}</div>

        <div className="space-x-3">
          <button
            onClick={() => setIsRunning(true)}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Start
          </button>

          <button
            onClick={() => setIsRunning(false)}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Stop
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

      <div className="bg-gray-800 p-4 rounded mb-6 text-center">
        <h2 className="text-lg">
          Total Focus Time: <span className="font-bold">{totalTime}</span> mins
        </h2>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl mb-4">Session History</h2>

        {sessions.length === 0 ? (
          <p>No sessions yet</p>
        ) : (
          <ul>
            {sessions.map((session) => (
              <li key={session.id} className="mb-2 border-b pb-2">
                ⏱ {session.duration} min — {session.date}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;