import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedia } from "./StreamProvider";

interface PeerProviderProps {
  children: React.ReactNode;
}

interface PeerContextType {
  peerId: string | null;
  peerName: string | null;
  sessionId: string | null;
  status: "accepted" | "rejected" | "pending" | "invalid" | null;
  peerSocket: WebSocket | null;
  pc: RTCPeerConnection | null;
  hostStream: MediaStream | null;
  sendJoinRequest: (name: string, sessionId: string, ws: WebSocket) => void;
}

const PeerContext = React.createContext<PeerContextType | null>(null);

export const PeerProvider = ({ children }: PeerProviderProps) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "accepted" | "rejected" | "pending" | "invalid" | null
  >(null);
  const [peerSocket, setpeerSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const navigate = useNavigate();
  const [hostStream, setHostStream] = useState<MediaStream | null>(null);
  const { localStream } = useMedia();

  const sendJoinRequest = (name: string, sessionId: string, ws: WebSocket) => {
    setpeerSocket(ws);
    setSessionId(sessionId);
    setPeerName(name);
    setStatus("pending");

    ws.onopen = () => {
      console.log(
        "1 Participant WebSocket connection opened and sent join request to host"
      );
      ws.send(
        JSON.stringify({ type: "join-meeting", peerName: name, sessionId })
      );
      navigate(`/approval/${sessionId}`);
    };
  };

  const handleParticipantAdded = async (message: any) => {
    console.log("Participant accepted got to know");
    const { peerId, sdp } = message;
    const pc = new RTCPeerConnection();
    setPc(pc);
    setPeerId(peerId);
    setStatus("accepted");

    pc.onicecandidate = event => {
      if (event.candidate) {
        console.log("Sending ice candidate to the host");
        peerSocket?.send(JSON.stringify({
          type: 'ice-candidate',
          peerId,
          sessionId,
          candidate: event.candidate
        }));
      }
      else {
        console.log("Ice gathering complete");
      }
    };

    pc.ontrack = event => {
      console.log("Receiving host streram");
      setHostStream(event.streams[0]);
    };

    try {
      console.log("2 Storing the offer");
      await pc.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
      console.log("3 Creating Answer");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("4 Sending answer to the host");
      peerSocket?.send(
        JSON.stringify({
          type: "answer",
          sessionId,
          peerId,
          sdp: answer
        })
      );

      if (localStream) {
        console.log("Sending particiapnt stream to the host");
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      if (!localStream) {
        console.log("Localstream not found");
        console.log(localStream);
      }
    } catch (err) {
      console.error("Error during the participant add process:", err);
    }
  };

  const handleIceCandidate = async (message: any) => {
    console.log("10 Host sent an ICE candidate");
    const { candidate } = message;
    console.log(candidate);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  useEffect(() => {
    if (!peerSocket) return;

    peerSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("received a message from signalling server ", message);
      switch (message.type) {
        case "participant-added":
          handleParticipantAdded(message);
          break;
        case "ice-candidate":
          handleIceCandidate(message);
          break;
        case "participant-rejected":
          setStatus("rejected");
          break;
        default:
          console.warn("Unhandled message type:", message.type);
      }
    };
  }, [peerSocket]);

  const value = {
    peerId,
    peerName,
    sessionId,
    status,
    peerSocket,
    pc,
    hostStream,
    sendJoinRequest,
  };

  return <PeerContext.Provider value={value}>{children}</PeerContext.Provider>;
};

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
};
