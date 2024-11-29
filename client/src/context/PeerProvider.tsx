import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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


  const sendJoinRequest = (name: string, sessionId: string, ws:WebSocket) => {
    setpeerSocket(ws);
    setSessionId(sessionId);
    setPeerName(name);
    setStatus('pending');
    ws.send(JSON.stringify({ type: 'join-meeting', peerName: name, sessionId }));
    navigate(`/approval/${sessionId}`)
  }

  const handleParticipantAccepted = (peerId: string) => {
    const pc = new RTCPeerConnection();
    setPc(pc);
    setPeerId(peerId);
    setStatus("accepted");
  }

  const handleOffer = async (sdp: RTCSessionDescriptionInit) => {
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      peerSocket?.send(JSON.stringify({type: "answer", peerId, sessionId, sdp: answer}))
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, peerId: string) => {
    if (pc) {
      await pc.addIceCandidate(candidate);
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
    }
  }

  useEffect(() => {
    if (!peerSocket) return;

    peerSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "invalid-sessionid") {
        setStatus("invalid");
        console.log(status);
      }

      if (message.type === 'participant-added') {
        const { peerId } = message;
        handleParticipantAccepted(peerId);
      }

      if (message.type === 'participant-rejected') {
        alert('Host did not add')
        setStatus('rejected');
      }

      if (message.type === 'offer') {
        const {sdp}=message;
        handleOffer(sdp);
      }

      if (message.type === 'ice-candidate') {
        const { candidate, peerId } = message;
        handleIceCandidate(candidate, peerId)
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