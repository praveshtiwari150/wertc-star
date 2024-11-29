import React, {useMemo} from 'react'
import { Participant } from '../../utils/constants';

interface ParticipantProps {
    isVideoTile?: boolean;
  participants: Participant[];
}

const VideoTile = ({ isVideoTile, participants }: ParticipantProps) => {
    const acceptedParticipants = useMemo(() => {
      return participants.filter((p) => p.status === "accepted");
    }, [participants]);

  return (
    <div>
        
    </div>
  )
}

export default VideoTile
