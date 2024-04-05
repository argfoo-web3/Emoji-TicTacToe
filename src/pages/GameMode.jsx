import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useNetworkContext } from '../NetworkContext';

function GameMode() {
  // Extract state from location
  const { state } = useLocation();
  const { clickedEmoji1, clickedEmoji2 } = state || {};
  const navigate = useNavigate();
  const [myPeerId, setMyPeerId] = useState('loading...');
  const [peerId, setPeerId] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [starter, setStarter] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentEmoji, setOpponentEmoji] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myPeerId);
    setCopySuccess('Copied!');
  };

  const networkContext = useNetworkContext();

  useEffect(() => {
    if(networkContext.peer != null) {
      setMyPeerId(networkContext.peer.id);
      networkContext.peer.on('open', function(id) {
        setMyPeerId(id);
      });
    }
  }, [networkContext.peer]);

  // Click handlers for game modes
  const handleClick1 = () => {
    navigate("/game", { state: { clickedEmoji1: clickedEmoji1, clickedEmoji2: opponentEmoji, easy: true, starter: starter } });
  };
  const handleClick2 = () => {
    navigate("/game", { state: { clickedEmoji1: clickedEmoji1, clickedEmoji2: opponentEmoji, easy: false } });
  };

  const handleConnect = () => {
    // Add your connection logic here
    const conn = networkContext.peer.connect(peerId);

    conn.on('open', function() {
      networkContext.conn.current = conn;
      setIsConnected(true);

      //alert('Connected to peer: ' + conn.peer + " Starter: " + !starter + " Emoji: " + clickedEmoji1);

      conn.send({ starter: false, opponentEmoji: clickedEmoji1, memo: 'memo1!'});
    });

    conn.on('data', function(data) {
      alert("temp bug fix: " + data);
    });

    conn.on('error', function(err) {
      alert(err);
    });
  };

  const receiveMessage = (data) => {
    if(!data.starter)
    {
      setStarter(data.starter);
      setIsConnected(true);
    }

    //alert('Received from peer: ' + data.starter + " Opp Emoji: " + data.opponentEmoji + " Memo: " + data.memo);
    
    setOpponentEmoji(data?.opponentEmoji);

    //stack trace log
    console.log(new Error().stack);
  }

  const openConnection = (conn) => {
    //alert('Sending to peer: ' + conn.peer + " peer is open: " + conn.open + " Starter: " + !starter + " Emoji: " + clickedEmoji1);
    conn.send({ starter: true, opponentEmoji: clickedEmoji1, memo: 'memo2!' });
  }

  useEffect(() => {
    networkContext.receiveCallback.current = receiveMessage;
    networkContext.openCallback.current = openConnection;
    setOpponentEmoji(clickedEmoji2);
  }, []);

  const handleInputChange = (event) => {
    setPeerId(event.target.value);
  };

  const handleSendMessage = () => {
    if (networkContext.conn.current && networkContext.conn.current.open) {
      networkContext.conn.current.send('Your message here');
    } else {
      alert('Connection is not open');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white w-full lg:w-[35%] rounded-lg px-5">
        {/* Game mode selection */}
        {isConnected && <div>You are now connected!</div>}
        <div className="text-black font-semibold text-3xl border-gray-200 border-b-2 w-full flex justify-center py-3">
          Select The Game Mode
        </div>
        <div className="flex justify-center my-3">
          <div>
            Peer ID: {myPeerId}
            <button onClick={copyToClipboard} className="ml-2">Copy</button>
            {copySuccess && <div style={{ color: 'green' }}>{copySuccess}</div>}
          </div>
        </div>
        <div className="flex justify-center my-3">
          <input 
            type="text" 
            placeholder="Enter peer ID to connect to." 
            className="border-2 border-gray-300 rounded px-3 py-2 mr-2 w-full" 
            value={peerId} 
            onChange={handleInputChange}
          />
          <button onClick={handleConnect} className="btn btn-glass text-2xl text-white bg-blue-700">Connect</button>
        </div>
        <div className="flex justify-center my-3">
          <button onClick={handleSendMessage} className="btn btn-glass text-2xl text-white bg-blue-700">Send Message</button>
        </div>
        <div className="flex justify-center my-3">
          <button
            onClick={handleClick1}
            className="btn btn-glass mx-3 text-2xl w-40 text-white bg-blue-700"
          >
            Easy
          </button>
          {/*<button
            onClick={handleClick2}
            className="btn btn-glass mx-3 text-2xl w-40 text-white bg-black"
          >
            Hard
          </button>*/}
        </div>
      </div>
    </div>
  );
}

export default GameMode;
