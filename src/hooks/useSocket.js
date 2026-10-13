import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { backendUrl } from '../config';

export function useSocket() {
  const [socketState, setSocketState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const socket = io(backendUrl, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const updateConnection = (status) => {
      setSocketState(socket);
      setConnectionStatus(status);
    };

    socket.on('connect', () => updateConnection('connected'));
    socket.on('disconnect', () => updateConnection('disconnected'));
    socket.on('connect_error', () => updateConnection('reconnecting'));
    socket.on('reconnect', () => updateConnection('connected'));
    socket.on('reconnect_attempt', () => updateConnection('reconnecting'));

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketState, connectionStatus };
}
