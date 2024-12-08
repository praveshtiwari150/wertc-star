import React, { useEffect, useMemo } from "react";

interface Participant {
  peerId: string;
  peerName: string;
  status: "accepted" | "pending";
  pc?: RTCPeerConnection | null;
  streams?: MediaStream | null;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

interface ParticipantProps {
  isVideoTile?: boolean;
  participants: Participant[];
}

const VideoTile = ({ isVideoTile, participants }: ParticipantProps) => {
  // Filter accepted participants
  const acceptedParticipants = useMemo(() => {
    return participants.filter((p) => p.status === "accepted");
  }, [participants]);

  // Add video refs to participants
  const modifiedParticipants = acceptedParticipants.map((participant) => ({
    ...participant,
    videoRef: participant.videoRef || React.createRef<HTMLVideoElement>(),
  }));

  // Attach streams to video elements
  useEffect(() => {
    modifiedParticipants.forEach((participant) => {
      if (participant.streams && participant.videoRef?.current) {
        participant.videoRef.current.srcObject = participant.streams;
      }
    });
  }, [modifiedParticipants]);

  return (
    <div className="h-full w-full overflow-auto hide-scrollbar">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
          gridAutoRows: `1fr`,
        }}
      >
        {modifiedParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            No Participant Joined
          </div>
        ) : (
          modifiedParticipants.map((participant) =>
            participant.streams ? (
              <div
                key={participant.peerId} // Apply unique key here
                className="relative group rounded-lg overflow-hidden shadow-md flex items-center justify-center"
              >
                {/* Participant Name */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-white text-sm font-medium opacity-50 group-hover:opacity-100 transition-opacity">
                  {participant.peerName}
                </div>
                {/* Video Tile */}
                <video
                  ref={participant.videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  playsInline
                />
              </div>
            ) : (
              <div
                key={participant.peerId} // Apply unique key here as well
                className="flex items-center justify-center text-center p-4 border rounded-md"
              >
                {participant.peerName} stream not found
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default VideoTile;
