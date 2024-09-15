import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

function Contact() {
    const [joined, setJoined] = useState(false);
    const [localTrack, setLocalTrack] = useState(null);
    const [remoteTrack, setRemoteTrack] = useState(null);
    const [client, setClient] = useState(null);

    const appId = "";
    const token = "";
    const channelName = "";


    const joinChannel = async () => {
        const agoraclient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await agoraclient.join(appId, channelName, token, null);
        setClient(agoraclient);
        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

        setLocalTrack(localVideoTrack);

        agoraclient.publish([localAudioTrack, localVideoTrack]);

        agoraclient.on("user-published", async (user, mediaType) => {
            await agoraclient.subscribe(user, mediaType);
            if (mediaType === "video") {
                const remoteVideoTrack = user.videoTrack;
                setRemoteTrack(remoteVideoTrack);
            }
        });

        setJoined(true);
    };

    // joinChannel();

    const leaveChannel = async () => {
        if (client) {
            client.leave();
            setJoined(false);
        }
        if (localTrack) localTrack.stop();
        if (remoteTrack) remoteTrack.stop();
    }


    return (
        <div>
            <div style={{ textAlign: "center" }}>
                <h1>Agora Video Call</h1>
                {/* {joined ? (
                    <div>
                        <div id="local-player" style={{ width: "300px", height: "300px", backgroundColor: "black" }}>
                            {localTrack && localTrack.play("local-player")}
                        </div>
                        <div id="remote-player" style={{ width: "300px", height: "300px", backgroundColor: "black" }}>
                            {remoteTrack && remoteTrack.play("remote-player")}
                        </div>
                    </div>
                ) : (
                    <p>Joining the channel...</p>
                )} */}
                <div style={{display:"flex", alignItems:"center",justifyContent:"center"}}>
                    <div id="local-player" style={{ width: "300px", height: "300px", backgroundColor: "black" }}>
                        {localTrack && localTrack.play("local-player")}
                    </div>
                    <div id="remote-player" style={{ width: "300px", height: "300px", backgroundColor: "black", margin:'10px' }}>
                        {remoteTrack && remoteTrack.play("remote-player")}
                    </div>
                </div>
                <button onClick={() => { joinChannel() }}>
                    Join Channel
                </button>
                <button onClick={() => { leaveChannel() }}>
                    Leave Channel
                </button>
            </div>
        </div>
    )
}

export default Contact