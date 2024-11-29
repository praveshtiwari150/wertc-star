import React, { useEffect } from 'react';
import { usePeer } from '../context/PeerProvider';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

const ApprovalPending = () => {
  const { peerName, status, sessionId } = usePeer();
  const navigate = useNavigate();
  console.log("Inside ApprovalPending: ", status);
  
  useEffect(() => {
    if (status === 'accepted') {
      navigate(`/${sessionId}`)
    }
  }, [status, sessionId, navigate])
  return (
    <div className="flex flex-col gap-2 justify-center items-center w-full h-[100vh]">
      {status === "pending" && (
        <>
          <Spinner />
          <div className="text-2xl font-semibold">
            Hello,{" "}
            <span className="text-3xl font-bold uppercase text-cobalt-4">
              {peerName}
            </span>
          </div>
          <div className="text-lg text-cobalt-3 font-medium">
            Please wait for the host to allow you in...
          </div>
        </>
      )}
      {status === "invalid" && (
        <>
          <div className="text-2xl text-cobalt-3 font-bold">
            Invalid SessionId!
          </div>
          <Link
            to={"/"}
            className="bg-cobalt-4  p-1 rounded-lg hover:bg-inidgo-6"
          >
            Go Back
          </Link>
        </>
      )}
      {status === "rejected" && (
        <>
          <div className="text-2xl text-cobalt-3 font-bold">
            Host did not allow you in.
          </div>
          <Link
            to={"/"}
            className="bg-cobalt-4  p-1 rounded-lg hover:bg-inidgo-6"
          >
            Go Back
          </Link>
        </>
      )}
    </div>
  );
}

export default ApprovalPending
