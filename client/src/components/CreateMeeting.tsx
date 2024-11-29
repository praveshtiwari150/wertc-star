import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHost } from "../context/HostProvider";
import { SIGNALING_SERVER } from "../utils/constants";

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { createMeeting } = useHost();

  const handleCreateMeeting = (event: FormEvent) => {
    event?.preventDefault();
    
    const ws = new WebSocket(SIGNALING_SERVER);
    ws.onopen = () => {
      console.log('Socket connection opened at create meeting');
      ws.send(JSON.stringify({ type: 'create-meeting', email }));
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'meeting-created') {
        const { sessionId } = message
        createMeeting(sessionId, name, email, ws);
        navigate(`/room/${sessionId}`);
      }
    } 

    ws.onclose = () => {
      console.log('create meeting WebSocket connection closed')
    }
  };

  return (
    <>
      <form
        onSubmit={handleCreateMeeting}
        className="flex flex-col h-[250px] border border-cobalt-4 p-8 rounded-xl gap-4 justify-center items-center"
      >
        <div className="flex gap-2">
          <label className="text-lg" htmlFor="email">
            Name
          </label>
          <input
            onChange={(event) => setName(event.target.value)}
            name="name"
            type="text"
            className="bg-cobalt-2 text-charcoal-6 rounded-md outline-none px-3"
          />
        </div>
        <div className="flex gap-2">
          <label className="text-lg" htmlFor="email">
            Email
          </label>
          <input
            onChange={(event) => setEmail(event.target.value)}
            name="email"
            type="email"
            className="bg-cobalt-2 text-charcoal-6 rounded-md outline-none px-3"
          />
        </div>
        <div className="w-full">
          <button className="bg-cobalt-4 w-full p-2 rounded-lg hover:bg-inidgo-6">
            Create Meeting
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateMeeting;
