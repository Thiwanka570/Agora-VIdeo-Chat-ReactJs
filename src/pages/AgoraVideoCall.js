import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "70e6d6d77bd845fc9f08854f4f1fc4e3"; // replace with your Agora App ID
const TOKEN = "007eJxTYFBV7GK9LWP14FiTWHnbk+PqbDI26TdjPm3JSREMSGXMKlFgMDdINUsxSzE3T0qxMDFNS7ZMM7CwMDVJM0kzTEs2STWWffw6rSGQkSGz6xULIwMEgvhcDBmpiTklGcmJRakMDABiuCBq"; // replace with your token if applicable
const CHANNEL = "healthcare"; // consultation room name

const VideoCall = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  useEffect(() => {
    let localTracks = {
      videoTrack: null,
      audioTrack: null,
    };

    const init = async () => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setUsers((prevUsers) => [...prevUsers, user]);
          if (user.uid === "doctor") {
            setDoctorJoined(true);
          }
          user.videoTrack.play(document.getElementById(user.uid));
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        if (user.uid === "doctor") {
          setDoctorJoined(false);
        }
      });

      client.on("user-left", (user) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        if (user.uid === "doctor") {
          setDoctorJoined(false);
        }
      });

      // Join the Agora channel
      await client.join(APP_ID, CHANNEL, TOKEN, role === "doctor" ? "doctor" : null);

      // Create local tracks (video and audio)
      localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      // Publish local tracks to the channel
      await client.publish([localTracks.videoTrack, localTracks.audioTrack]);

      // Play the local video track
      localTracks.videoTrack.play("local-player");
      setStart(true);
    };

    // Initialize the client and tracks when component mounts
    if (role === "doctor" || (role === "patient" && doctorJoined)) {
      init();
    }

    return () => {
      // Cleanup on unmount
      localTracks.videoTrack && localTracks.videoTrack.stop();
      localTracks.videoTrack && localTracks.videoTrack.close();
      localTracks.audioTrack && localTracks.audioTrack.stop();
      localTracks.audioTrack && localTracks.audioTrack.close();
      client && client.leave();
    };
  }, [client, role, doctorJoined]);

  return (
    <div>
      {role === "patient" && !doctorJoined ? (
        <h3>Waiting for the doctor to join...</h3>
      ) : (
        <div id="video-container">
          {start && <div id="local-player" style={{ width: "400px", height: "300px" }}></div>}
          {users.length > 0 &&
            users.map((user) => (
              <div id={user.uid} key={user.uid} style={{ width: "400px", height: "300px" }}></div>
            ))}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
