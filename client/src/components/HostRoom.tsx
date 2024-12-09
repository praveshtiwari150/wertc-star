import VideoDisplay from "./video/VideoDisplay";
import VideoControls from "./video/VideoControls";
import VideoTile from "./video/VideoTile";
import Participants from "./Participants";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHost } from "../context/HostProvider";
import { useMedia } from "../context/StreamProvider";

const HostRoom = () => {
  const { sessionId } = useParams();
  const {
    localStream,
    videoEnabled,
    audioEnabled,
    getLocalStream,
    toggleVideo,
    toggleAudio,
  } = useMedia();
  const [isParticipantComp, setIsParticipantComp] = useState(false);
  const [isVideoTile, setIsVideoTile] = useState(true);

  const { participants } = useHost();

  if (!sessionId) {
    throw Error("Cannot fetch sessionId from params");
  }

  const toggleParticipant = () => {
    if (isVideoTile) {
      setIsVideoTile((prev) => !prev);
    }
    setIsParticipantComp((prev) => !prev);
  };

  const toggeleStream = () => {
    if (isParticipantComp) {
      setIsParticipantComp(prev => !prev);
    }
    setIsVideoTile((prev) => !prev);
  };

  
  useEffect(() => {
    getLocalStream();
  }, []);

  return (
    <div className="max-h-screen bg-charcoal-10 p-4 grid gap-4 lg:grid-cols-4">
      <div
        className={`max-h-screen bg-charcoal-6 flex flex-col justify-center items-center gap-2 rounded-lg p-1 transition-transform duration-300 ${
          isParticipantComp && "lg:col-span-3"
        } ${isVideoTile && "lg:col-span-2"} ${
          !isParticipantComp && !isVideoTile && "lg:col-span-4"
        }`}
      >
        {/* VideoDisplay */}
        <VideoDisplay stream={localStream} />

        {/* VideoControls */}
        <VideoControls
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
          toggleParticipant={toggleParticipant}
          toggleStream={toggeleStream}
          videoEnabled={videoEnabled}
          audioEnabled={audioEnabled}
          sessionId={sessionId}
        />
      </div>

      {isVideoTile && (
        <div className="max-h-screen bg-charcoal-6 p-1 rounded-lg  lg:col-span-2">
          <VideoTile
            isVideoTile={isVideoTile}
            participants={participants}
          />
        </div>
      )}

      {isParticipantComp && (
        <aside
          className={`max-h-screen flex flex-col gap-4 border rounded-lg p-4 bg-gray-100 ${
            isParticipantComp ? "lg:col-span-1" : ""
          }`}
        >
          <Participants
            isParticipantComp={isParticipantComp}
            participants={participants}
          />
        </aside>
      )}
    </div>
  );
};

export default HostRoom;
