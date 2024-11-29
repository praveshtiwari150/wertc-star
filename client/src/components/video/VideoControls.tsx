import React, { useState } from "react";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import {
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
} from "react-icons/hi2";
import { BsPersonVideo } from "react-icons/bs";
import { MdPeopleAlt, MdContentCopy, MdCheck } from "react-icons/md";
import ControlLabel from "./ControlLabel";

interface VideoControlsProps {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleParticipant?: () => void;
  toggleStream?: () => void
  videoEnabled: boolean;
  audioEnabled: boolean;
  sessionId: string;
}

const VideoControls = ({
  toggleVideo,
  toggleAudio,
  toggleParticipant,
  toggleStream,
  videoEnabled,
  audioEnabled,
  sessionId,
}: VideoControlsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);

    // Reset the button after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-6 items-center mt-4">
      {/* Toggle Video */}
      <ControlLabel label={videoEnabled ? "Disable Video" : "Enable Video"}>
        <button
          onClick={toggleVideo}
          className="bg-cobalt-4 hover:bg-cobalt-3 p-4 rounded-full"
        >
          {videoEnabled ? (
            <HiOutlineVideoCamera className="text-white" />
          ) : (
            <HiOutlineVideoCameraSlash className="text-white" />
          )}
        </button>
      </ControlLabel>

      {/* Toggle Audio */}
      <ControlLabel label={audioEnabled ? "Mute Audio" : "Unmute Audio"}>
        <button
          onClick={toggleAudio}
          className="bg-cobalt-4 hover:bg-cobalt-3 p-4 rounded-full"
        >
          {audioEnabled ? (
            <AiFillAudio className="text-white" />
          ) : (
            <AiOutlineAudioMuted className="text-white" />
          )}
        </button>
      </ControlLabel>

      {/* View Participants */}
      <ControlLabel label="Participants">
        <button
          onClick={toggleParticipant}
          className="bg-cobalt-4 hover:bg-cobalt-3 p-4 rounded-full"
        >
          <MdPeopleAlt className="text-white" />
        </button>
      </ControlLabel>

      {/* View Streams */}
      {/* View Participants */}
      <ControlLabel label="Streams">
        <button
          onClick={toggleStream}
          className="bg-cobalt-4 hover:bg-cobalt-3 p-4 rounded-full"
        >
          <BsPersonVideo className="text-white" />
        </button>
      </ControlLabel>

      {/* Copy Session ID */}
      <ControlLabel label={copied ? "Session ID Copied!" : "Copy Session ID"}>
        <button
          onClick={handleCopy}
          className={`bg-cobalt-4 hover:bg-cobalt-3 p-4 rounded-full transition-transform duration-300 ${
            copied ? "scale-110" : "scale-100"
          }`}
        >
          {copied ? (
            <MdCheck className="text-white transition-opacity duration-300" />
          ) : (
            <MdContentCopy className="text-white transition-opacity duration-300" />
          )}
        </button>
      </ControlLabel>
    </div>
  );
};

export default VideoControls;
