import { useState, useEffect } from "react";
import { useHost } from "../context/HostProvider";
import { useNavigate } from "react-router-dom";
import { SIGNALING_SERVER } from "../utils/constants";
import { usePeer } from "../context/PeerProvider";

const JoinMeeting = () => {
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const { sendJoinRequest } = usePeer();
  const { hostWs } = useHost();
  const navigate = useNavigate();

  const handleJoinMeeting = (event: any) => {
    event.preventDefault();
    const ws = new WebSocket(SIGNALING_SERVER);
    
    ws.onopen = () => {
      sendJoinRequest(name, sessionId, ws);
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }

  return (
    <div className="flex flex-col h-[250px] border border-cobalt-4 p-8 rounded-xl gap-4 justify-center items-center">
      <form
        className="flex flex-col gap-4 justify-center items-end"
        onSubmit={handleJoinMeeting}
      >
        <div className="flex gap-2">
          <label htmlFor="">Name</label>
          <input
            onChange={(event: any) => setName(event?.target.value)}
            type="text"
            className="bg-cobalt-2 text-charcoal-6 rounded-md outline-none px-3"
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="">Session Id</label>
          <input
            onChange={(event: any) => setSessionId(event?.target.value)}
            type="text"
            className="bg-cobalt-2 text-charcoal-6 rounded-md outline-none px-3"
          />
        </div>
        <button
          type="submit"
          className="bg-cobalt-4 w-full p-2 rounded-lg hover:bg-inidgo-6"
        >
          Join Meeting
        </button>
      </form>
    </div>
  );
}

export default JoinMeeting;