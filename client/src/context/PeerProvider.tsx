import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia } from './StreamProvider';

interface PeerProviderProps {
  children: React.ReactNode;
}

interface PeerContextType {
  peerId: string | null;
  peerName: string | null;
  sessionId: string | null;
  status: 'accepted' | 'rejected' | 'pending' | 'invalid' |null;
  peerSocket: WebSocket | null;
  pc: RTCPeerConnection | null;
  sendJoinRequest: (name: string, sessionId: string, ws: WebSocket) => void;
}

const PeerContext = React.createContext<PeerContextType | null>(null);
export const PeerProvider = ({ children }: PeerProviderProps) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'accepted' | 'rejected' | 'pending' | 'invalid' |null>(null);
  const [peerSocket, setpeerSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const navigate = useNavigate();
  const { localStream } = useMedia();

  const sendStream = async (pc: RTCPeerConnection, stream: MediaStream) => {
    try {
      if (!stream || !pc) return;
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (err) {
      console.log("Error while sending stream", err);
    }
  };

  const sendJoinRequest = (name: string, sessionId: string, ws:WebSocket) => {
    setpeerSocket(ws);
    setSessionId(sessionId);
    setPeerName(name);
    setStatus('pending');
    ws.send(JSON.stringify({ type: 'join-meeting', peerName: name, sessionId }));
    navigate(`/approval/${sessionId}`)
  }


  const handleParticipantAccepted = async (peerId: string, sdp: RTCSessionDescriptionInit) => {
    const pc = new RTCPeerConnection();
    setPc(pc);
    setPeerId(peerId);
    setStatus("accepted");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        peerSocket?.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            sessionId,
            peerId,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      console.log("Incoming stream: ", event.streams[0]);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    peerSocket?.send(
      JSON.stringify({ type: "answer", peerId, sessionId, sdp: answer })
    );

    if (localStream) {
      await sendStream(pc, localStream);
    } else {
      console.log("Local stream is null, cannot send stream");
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (pc) {
      await pc.addIceCandidate(candidate);
      console.log("Ice candidate added:", candidate);
    }
  }


  useEffect(() => {
    if (!peerSocket) return;

    peerSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "invalid-sessionid":
          setStatus("invalid");
          break;

        case "participant-added":
          const {peerId, sdp} = message
          handleParticipantAccepted(peerId, sdp);
          break;

        case "participant-rejected":
          setStatus("rejected");
          break;

        case "ice-candidate":
          const { candidate } = message;
          handleIceCandidate(candidate);
          break;
      }
    }
  }, [peerSocket])
  const value = {peerId, peerName, sessionId,status, peerSocket, pc,sendJoinRequest}
  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  )
}

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
};