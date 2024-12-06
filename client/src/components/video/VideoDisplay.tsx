import React, { useEffect, useRef } from "react";

interface VideoDisplayProps {
  stream: MediaStream | null;
}

const VideoDisplay = ({ stream }: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div>
      <video className="w-full h-[80px] md:h-[220px] lg:h-[400px] rounded-lg" ref={videoRef} muted autoPlay playsInline />
    </div>
  );
};

export default VideoDisplay;
