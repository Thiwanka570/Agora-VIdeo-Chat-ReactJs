import React, { useState } from "react";
import VideoCall from "./pages/AgoraVideoCall";

function App() {
  const [role, setRole] = useState(""); // Role: 'doctor' or 'patient'
  
  return (
    <div className="App">
      <h1>Doctor-Patient Video Consultation</h1>
      {!role ? (
        <div>
          <h3>Select Role to Join Video Call</h3>
          <button onClick={() => setRole("doctor")}>Join as Doctor</button>
          <button onClick={() => setRole("patient")}>Join as Patient</button>
        </div>
      ) : (
        <VideoCall role={role} />
      )}
    </div>
  );
}

export default App;
