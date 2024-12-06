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
      { peerId, peerName, status: "pending", pc: null, stream: null },
    ]);
  };

  const handleIncomingStream = (peerId: string, stream: MediaStream) => {
    setParticipants((prevParticipants) =>
      prevParticipants.map((person) =>
        person.peerId === peerId ? { ...person, stream: stream } : person
      )
    );
  };

  const acceptAndUpdateParticipant = async (peerId: string) => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      console.log("Ice candidate event", event);
      if (event.candidate) {
        if (hostWs) {
          console.log("Host ws in acceptAndUpdateParticipant: ", hostWs);
          hostWs.send(
            JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate,
              sessionId,
              peerId,
            })
          );
        } else {
          console.log("Websocket is null, cannot send ice candidate");
        }
      } else {
        console.log("Cannot find event");
      }
    };

    pc.ontrack = (event) => {
      console.log("Track");
      handleIncomingStream(peerId, event.streams[0]);
    };

    if (localStream) {
      await sendStream(pc, localStream);
    } else {
      console.warn("Local stream is null, cannot send stream.");
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    setParticipants((previousParticipants) =>
      previousParticipants.map((person) =>
        person.peerId === peerId
          ? { ...person, status: "accepted", pc }
          : person
      )
    );
    hostWs?.send(
      JSON.stringify({
        type: "participant-added",
        peerId,
        sessionId,
        sdp: offer,
      })
    );
  };

  const removeAndUpdateParticipant = (peerId: string) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.peerId !== peerId)
    );

    hostWs?.send(
      JSON.stringify({ type: "participant-rejected", peerId, sessionId })
    );
  };

  const handleParticipantAnswer = async (message: any) => {
    const { peerId, sdp } = message;
    const peer = participants.find((p) => p.peerId === peerId);
    if (peer && peer.pc) {
      console.log(`Setting remote description for peer: ${peerId}`);
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("Remote Description set for peer:", peerId);
    }
  };

  const handleParticipantIceCandidate = async (message: any) => {
    const { candidate, peerId } = message;

    console.log("inside handleParticipantsIceCandidate");
    console.log(participants);
    const peer = participants.find((p) => p.peerId === peerId);
    if (peer && peer.pc) {
      console.log(`Adding Ice Candidate for peer: ${peerId}`);
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`Ice candidate added for ${peerId}`);
    } else {
      console.log(`PeerConnection not found for peer ${peerId}`);
    }
  };

  useEffect(() => {
    if (!hostWs) return;

    hostWs.onopen = () => {
      console.log("Host Websocket connection opened");
    };

    hostWs.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "join-request": {
          const { peerId, peerName } = message;
          addParticipant(peerId, peerName);
          break;
        }

        case "answer": 
          handleParticipantAnswer(message);
          break;

        case "ice-candidate":
          console.log("ice-candidate:host", hostName);
          console.log("sessionId,", sessionId);
          console.log("Before handle ice-candidate function :");
          console.log(participants);
          handleParticipantIceCandidate(message);
          break;

        default:
          console.warn("Unhandled message type:", message.type);
      }
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
