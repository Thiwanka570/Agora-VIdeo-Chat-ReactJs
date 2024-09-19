import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useLocation } from 'react-router-dom';

function Contact() {
    const [joined, setJoined] = useState(false);
    const [localTrack, setLocalTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]); // Array to hold multiple remote users
    const [client, setClient] = useState(null);
    const [inviteLink, setInviteLink] = useState("");

    const appId = "your-agora-app-id";
    const token = "your-agora-token";
    const defaultChannelName = "default-channel";

    // Get channel name from URL for invite link
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const channelNameFromLink = queryParams.get('channel') || defaultChannelName;

    // Function to join the channel
    const joinChannel = async (channelName) => {
        const agoraclient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await agoraclient.join(appId, channelName, token, null);
        setClient(agoraclient);

        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

        setLocalTrack(localVideoTrack);

        agoraclient.publish([localAudioTrack, localVideoTrack]);

        // Handle new remote user published
        agoraclient.on("user-published", async (user, mediaType) => {
            await agoraclient.subscribe(user, mediaType);
            if (mediaType === "video") {
                const remoteVideoTrack = user.videoTrack;
                setRemoteUsers((prevUsers) => [...prevUsers, { uid: user.uid, videoTrack: remoteVideoTrack }]);
            }
        });

        // Handle remote user unpublished (leaving)
        agoraclient.on("user-unpublished", (user) => {
            setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        });

        setJoined(true);
    };

    // Generate invite link
    const generateInviteLink = () => {
        const channelName = Math.random().toString(36).substring(2, 15); // Random channel name
        const inviteUrl = `${window.location.origin}${window.location.pathname}?channel=${channelName}`;
        setInviteLink(inviteUrl);
    };

    // Leave the channel
    const leaveChannel = async () => {
        if (client) {
            await client.leave();
            setJoined(false);
        }
        if (localTrack) localTrack.stop();
        remoteUsers.forEach((user) => {
            if (user.videoTrack) user.videoTrack.stop();
        });
        setRemoteUsers([]);
    };

    // Automatically join channel if invite link is used
    useEffect(() => {
        if (channelNameFromLink) {
            joinChannel(channelNameFromLink);
        }
    }, [channelNameFromLink]);

    return (
        <div>
            <div style={{ textAlign: "center" }}>
                <h1>Agora Video Call</h1>
                {joined ? (
                    <div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {/* Local Player */}
                            <div id="local-player" style={{ width: "300px", height: "300px", backgroundColor: "black", margin: "10px" }}>
                                {localTrack && localTrack.play("local-player")}
                            </div>

                            {/* Remote Players */}
                            {remoteUsers.map((user) => (
                                <div key={user.uid} id={`remote-player-${user.uid}`} style={{ width: "300px", height: "300px", backgroundColor: "black", margin: "10px" }}>
                                    {user.videoTrack && user.videoTrack.play(`remote-player-${user.uid}`)}
                                </div>
                            ))}
                        </div>

                        <button onClick={leaveChannel}>Leave Channel</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => joinChannel(channelNameFromLink)}>
                            Join Channel
                        </button>
                    </div>
                )}

                {/* Invite Link Section */}
                <div>
                    <button onClick={generateInviteLink}>Generate Invite Link</button>
                    {inviteLink && (
                        <div>
                            <p>Share this link to invite others:</p>
                            <a href={inviteLink} target="_blank" rel="noopener noreferrer">{inviteLink}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Contact;
