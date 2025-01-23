import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';

export const CollaboratorsList = () => {
  const [users, setUsers] = useState([]);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    // Escuchar evento del backend cuando se actualiza la lista de usuarios
    socket.on('usersInRoom', (usersInRoom) => {
      console.log('Usuarios recibidos:', usersInRoom); // Verifica si se reciben los usuarios
      setUsers(usersInRoom);
    });

    // Limpia el evento al desmontar el componente
    return () => {
      socket.off('usersInRoom');
    };
  }, [socket]);

  return (
    <div className="p-4 border border-white bg-gray-700 rounded mt-2">
      <h3 className="text-white font-bold">Colaboradores en Sala</h3>
      <ul>
        {users && users.length > 0 ? (
          users.map(user => (
            <li key={user.id} className="flex justify-between items-center p-2 text-white">
              {/* Mostrar el nombre del usuario si está disponible, de lo contrario mostrar 'Sin nombre' */}
              {user.name ? user.name : `Usuario ${user.id}`}

              <button
                className={`ml-2 px-2 py-1 rounded-full ${user.connected ? 'bg-green-500' : 'bg-gray-500'}`}
                title={user.connected ? 'Conectado' : 'Desconectado'}
              >
                {/* El color del botón indica el estado */}
              </button>
            </li>
          ))
        ) : (
          <p className="text-white">No hay colaboradores conectados</p>
        )}
      </ul>
    </div>
  );
};
