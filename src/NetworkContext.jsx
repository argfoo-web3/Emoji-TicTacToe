import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';

const options = {
    host: '127.0.0.1',
    port: 9001,
    path: '/server',
    secure: false,
};

// Create a Context object
export const NetworkContext = createContext();

// Create a Provider component
export const NetworkProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const conn = useRef(null);
  const receiveCallback = useRef(null);
  const openCallback = useRef(null);

  useEffect(() => {
    const myPeer = new Peer(options);

    /*myPeer.on('open', function(id) {
      setMyPeerId(id);
    });*/

    myPeer.on('error', function(err) {
      if(err.type === 'network') {
        myPeer.reconnect();
      }
      alert(err);
    });

    myPeer.on('connection', function(newConn) {
      newConn.on('open', function() {
      
      });

      newConn.on('data', function(data) {
        if(conn.current == null) {
          // connecting to incoming peer successful
          const incomingPeer = myPeer.connect(newConn.peer);
          conn.current = incomingPeer;

          incomingPeer.on('open', function() {
            if(openCallback.current != null)
            {
                openCallback.current(incomingPeer);
            }
          });
        }
        
        if(receiveCallback.current != null)
        {
            receiveCallback.current(data);
        }
      });
    
      newConn.on('error', function(err) {
        alert(err);
      });
    });

    setPeer(myPeer);

    // Cleanup function
    return () => {
      myPeer.disconnect();
      myPeer.destroy();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ peer, setPeer, conn, receiveCallback, openCallback }}>
      {children}
    </NetworkContext.Provider>
  );
};

// Create a custom hook for using the context
export const useNetworkContext = () => useContext(NetworkContext);