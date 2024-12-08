import React, { useMemo } from "react";
import { Participant } from "../utils/constants";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import { useHost } from "../context/HostProvider";

interface ParticipantProps {
  participants: Participant[];
  isParticipantComp?: boolean;
}

const Participants = ({ participants, isParticipantComp }: ParticipantProps) => {
  const {acceptParticipant, removeAndUpdateParticipant} = useHost()
  const accepted = useMemo(() => {
    return participants.filter((p) => p.status === "accepted");
  }, [participants]);
  const pending = useMemo(() => {
    return participants.filter((p) => p.status === "pending");
  },[participants])
  return (
    <div className={`p-4 min-h-screen max-h-screen flex flex-col gap-2`}>
      <div className="h-1/4 border border-cobalt-5 p-2 rounded-lg ">
        <div className="flex justify-between">
          <div className="text-xl font-bold text-charcoal-9">Requests</div>
          <button className="text-xs px-4 border border-cobalt-4 text-cobalt-4 rounded-md hover:border-cobalt-8 hover:text-cobalt-8 font-medium">
            Add All
          </button>
        </div>
        <div className="h-[68%] p-4 mt-2 flex flex-col gap-2 justify-start rounded-lg border custom-scrollbar overflow-auto">
          {pending.map((participant) => (
            <div
              className="flex p-2 w-full justify-between border-b border-b-inidgo-5 hover:shadow hover:rounded-t-lg"
              key={participant.peerId}
            >
              <div className="text-cobalt-4 text-lg font-semibold">
                {participant.peerName}
              </div>
              <div className="flex gap-4">
                <button
                  className="text-xl rounded-full text-cobalt-4 hover:text-green-500"
                  onClick={() => acceptParticipant(participant.peerId)}
                >
                  <FaRegCheckCircle />
                </button>
                <button
                  className="text-2xl rounded-full text-cobalt-4 hover:text-red-500"
                  onClick={() => removeAndUpdateParticipant(participant.peerId)}
                >
                  <RiCloseCircleLine />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-3/4 border border-cobalt-5 p-2 rounded-lg">
        <div className="text-xl font-bold text-charcoal-9">Participants</div>
        <div className="p-4 rounded-lg h-[90%] mt-2 flex flex-col gap-2 justify-start border custom-scrollbar overflow-auto">
          {accepted.map((participant: Participant) => (
            <div
              className="flex p-2 w-full justify-between cursor-pointer border-b border-b-inidgo-5 hover:shadow hover:rounded-t-lg"
              key={participant.peerId}
            >
              <div className="text-cobalt-4 text-lg font-semibold">
                {participant.peerName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Participants;
