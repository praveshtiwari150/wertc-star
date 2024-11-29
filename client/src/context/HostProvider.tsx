import React, { useContext, useEffect, useState } from "react";
import { useMedia } from "./StreamProvider";

interface HostProviderProps {
  children: React.ReactNode;
}

interface Participant {
  peerId: string;
  peerName: string;
  status: "accepted" | "pending";
  pc?: RTCPeerConnection | null;
  participantStreams?: MediaStream | null
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
  addParticipant: (peerId: string, peerName: string) => void;
  acceptAndUpdateParticipant: (peerId: string) => void;
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
    console.log("Host webs socket: ", hostWs);
  };

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

  const addParticipant = (peerId: string, peerName: string) => {
    setParticipants((prev) => [
      ...prev,
      { peerId, peerName, status: "pending" },
    ]);
  };

  const handleIncomingStream = (peerId: string, stream: MediaStream) => {
    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) =>
        participant.peerId === peerId
          ? { ...participant, participantStreams: stream }
          : participant
      )
    );
  }

  const acceptAndUpdateParticipant = async (peerId: string) => {
    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      handleIncomingStream(peerId, stream);
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        hostWs?.send(JSON.stringify({
          type: 'ice-candidate',
          peerId,
          candidate: event.candidate,
          sessionId
        }))
      }
    }

    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) =>
        participant.peerId === peerId
          ? { ...participant, status: "accepted", pc }
          : participant
      )
    );

    hostWs?.send(
      JSON.stringify({ type: "participant-added", peerId, sessionId })
    );

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        hostWs?.send(
          JSON.stringify({ type: "offer", peerId, sessionId, sdp: offer })
        );
      } catch (error) {
        console.error("Error during negotiation:", error);
      }
    };

    if (!localStream) {
      console.log("localStream is null");
      return;
    }
    await sendStream(pc, localStream);
  };

  const removeAndUpdateParticipant = (peerId: string) => {
    setParticipants((prevParticipants) => {
      const participant = prevParticipants.find((p) => p.peerId === peerId);
      if (participant && participant.pc) {
        participant.pc.close(); // Close the peer connection
      }
      return prevParticipants.filter((p) => p.peerId !== peerId);
    });

    hostWs?.send(
      JSON.stringify({ type: "participant-rejected", peerId, sessionId })
    );
  };


  const handleParticipantAnswer = async (message: any) => {
    const { peerId, sdp } = message;
    const peer = participants.find((p) => p.peerId === peerId);
    if (peer && peer.pc) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleParticipantIceCandidate = async (message: any) => {
    const { candidate, peerId } = message;
    if (candidate) {
      const peer = participants.find((p) => p.peerId === peerId);
      await peer?.pc?.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  useEffect(() => {
    if (!hostWs) return;

    hostWs.onopen = () => {
      console.log("Host Websocket connection opened");
    };

    hostWs.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case "join-request": {
          const { peerId, peerName } = message;
          addParticipant(peerId, peerName);
          console.log(addParticipant);
          break;
        }

        case "answer":
          handleParticipantAnswer(message);
          break;

        case "ice-candidate":
          handleParticipantIceCandidate(message);
          break;

        default:
          console.warn("Unhandled message type:", message.type);
      }
    };

    return () => {
      console.log("Host Socket connection closed");
      hostWs.close();
    };
  }, [hostWs]);

  const value = {
    isHost,
    hostName,
    hostEmail,
    sessionId,
    hostWs,
    participants,
    createMeeting,
    addParticipant,
    acceptAndUpdateParticipant,
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
