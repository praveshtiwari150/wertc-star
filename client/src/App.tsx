import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";
import ApprovalPending from "./components/ApprovalPending";
import ParticipantRoom from "./components/ParticipantRoom";
import Peer from "./components/Peer";

function App() {

  return (
    <>
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path="/room/:sessionId" element={<Room/>}/>
        <Route path="/approval/:sessionId" element={<ApprovalPending />} />
        <Route path="/peer" element={<Peer/>} />
        <Route path="/:sessionId" element={<ParticipantRoom/>} />
      </Routes>
    </>
  )
}

export default App
