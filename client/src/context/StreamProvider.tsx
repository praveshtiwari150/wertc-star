import React, {
  createContext,
  useContext,
  useState,
} from "react";

interface MediaProviderProps {
  children: React.ReactNode;
}

interface MediaProviderTypes {
  localStream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  getLocalStream: () => Promise<void>;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

const MediaContext = createContext<MediaProviderTypes | null>(null);

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const getLocalStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        setLocalStream(stream);

      // Ensure initial track states match enabled flags
        stream.getVideoTracks().forEach((track) => (track.enabled = videoEnabled));
        stream.getAudioTracks().forEach((track) => (track.enabled = audioEnabled));
    }

    catch (err) {
        console.error("Error accessing media devices:", err);
        throw new Error("Failed to access media devices.");
    }
    };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const value = {
    localStream,
    videoEnabled,
    audioEnabled,
    getLocalStream,
    toggleVideo,
    toggleAudio,
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
