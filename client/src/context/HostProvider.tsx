import React, { useCallback, useContext, useEffect, useState } from "react";
import { useMedia } from "./StreamProvider";
import { SiOcaml } from "react-icons/si";

interface HostProviderProps {
  children: React.ReactNode;
}

interface Participant {
  peerId: string;
  peerName: string;
  status: "accepted" | "pending";
  pc?: RTCPeerConnection | null;
  stream?: MediaStream | null;
}

interface HostContextType {
  isHost: boolean;
  hostName: string | null;
  hostEmail: string | null;
  sessionId: string | null;
  hostWs: WebSocket | null;
  participants: Participant[];
  createMeeting: (
    sessionId: string,
    hostName: string,
    hostEmail: string,
    ws: WebSocket
  ) => void;
  handleParticipantJoinRequest: (peerId: string, peerName: string) => void;
  acceptParticipant: (peerId: string) => void;
  removeAndUpdateParticipant: (peerId: string) => void;
}

const HostContext = React.createContext<HostContextType | null>(null);

export const HostProvider = ({ children }: HostProviderProps) => {
  const [isHost, setIsHost] = useState<boolean>(false);
  const [hostName, setHostName] = useState<string | null>(null);
  const [hostEmail, setHostEmail] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hostWs, setHostWs] = useState<WebSocket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { localStream } = useMedia();

  const createMeeting = (
    sessionId: string,
    hostName: string,
    hostEmail: string,
    ws: WebSocket
  ) => {
    setIsHost(true);
    setSessionId(sessionId);
    setHostName(hostName);
    setHostEmail(hostEmail);
    setHostWs(ws);
  };

  const handleParticipantJoinRequest = (peerId: string, peerName: string) => {
    setParticipants((prev) => [
      ...prev,
      { peerId, peerName, status: "pending", pc: null, stream: null },
    ]);
  };

  const acceptParticipant = async (peerId: string) => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ice-candidate");
        hostWs?.send(
          JSON.stringify({
            type: "ice-candidate",
            peerId,
            sessionId,
            candidate: event.candidate,
          })
        );
      } else {
        console.log("Ice gathering complete");
      }
    };

    pc.ontrack = (event) => {
      console.log("Receiving particiapnt stream");
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) =>
          p.peerId === peerId ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    const participant = participants.find(p => p.peerId === peerId);

    if (participant) {
      console.log("Participant exists");
      try {
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
          });
        }

        const offer = await pc.createOffer();
        console.log("offer created and stored in the local description");
        await pc.setLocalDescription(offer);
        console.log("Sending offer to the participant");
        hostWs?.send(JSON.stringify({
          type: "participant-added",
          peerId,
          sessionId,
          sdp:offer
        }))

        setParticipants((prevParticipants) =>
          prevParticipants.map((p) =>
            p.peerId === peerId ? { ...p, status: "accepted", pc } : p
          )
        );

        console.log("Collecting ice candidate");
      }

      catch (err) {
        console.log(err);
      }
    }
  };

  const removeAndUpdateParticipant = (peerId: string) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.peerId !== peerId)
    );

    hostWs?.send(
      JSON.stringify({ type: "participant-rejected", peerId, sessionId })
    );
  };

  const handleAnswer = async (message: any) => {
    const { peerId, sdp } = message;
    const participant = participants.find(p => p.peerId === peerId);
    if (participant) {
      console.log("Participant found")
      const { pc } = participant;
      if (pc) {
        console.log("Participant has pc");
        console.log(pc);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }

      else {
        console.log("pc not found for the participant")
      }
    }
    else {
      console.log("Participant not found");
      console.log("particiapnts array size is: ", participants.length);
    }
  }

  const handleIceCandidate = async (message: any) => {
    const { peerId, candidate } = message;
    const participant = participants.find(p => p.peerId === peerId);
    if (participant) {
      const {pc} = participant
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }

    else {
      console.log("Participant not found");
      console.log("Participant array size: ", participants.length);
    }
  }

  useEffect(() => {
    if (!hostWs) return;

    hostWs.onopen = () => {
      console.log("5 Host WebSocket connection opened");
    };

    hostWs.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case "join-request": {
          const { peerId, peerName } = message;
          console.log("Handling join request from peer:", peerId, peerName);
          handleParticipantJoinRequest(peerId, peerName);
          break;
        }
        case "answer":
          handleAnswer(message);
          break;

        case "ice-candidate":
          handleIceCandidate(message)
          break;

        case "participant-rejected": {
          const { peerId } = message;
          console.log("Participant rejected:", peerId);
          removeAndUpdateParticipant(peerId);
          break;
        }
        default:
          console.warn("Unhandled message type:", message.type);
      }
    };

    hostWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    hostWs.onclose = () => {
      console.log("Peer WebSocket connection closed");
    };
  }, [hostWs, participants]);

  const value = {
    isHost,
    hostName,
    hostEmail,
    sessionId,
    hostWs,
    participants,
    createMeeting,
    handleParticipantJoinRequest,
    acceptParticipant,
    removeAndUpdateParticipant,
  };

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHost must be used within a HostProvider");
  }
  return context;
};
