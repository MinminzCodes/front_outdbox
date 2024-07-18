import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Importa el contexto de autenticación

function LoginModal({ isOpen, onClose }) {
  const { login } = useContext(AuthContext); // Obtiene la función login del contexto de autenticación
  const [username, setUsername] = useState(''); // Estado para almacenar el nombre de usuario ingresado
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña ingresada
  const [error, setError] = useState(null); // Estado para manejar errores durante el inicio de sesión

  // Función para manejar el evento de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setError(null); // Reinicia el estado de error antes de un nuevo intento de login

    try {
      const response = await fetch('https://api-outdbox.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { _id, username, reviews } = data.user; // Desestructura el objeto userData devuelto por el servidor
        const userData = { userId: _id, username, reviews }; // Construye el objeto userData con userId para que coincida

        login(userData); // Llama a la función login del contexto de autenticación para establecer el usuario autenticado
        onClose(); // Cierra el modal de inicio de sesión
      } else {
        const errorData = await response.json();
        setError(errorData.error); // Establece el mensaje de error recibido desde el servidor
        console.error('Error en login:', errorData.error); // Loggea el error en la consola
      }
    } catch (error) {
      setError('Error en la autenticación. Inténtalo de nuevo.'); // Mensaje de error genérico para problemas de red u otros errores
      console.error('Error en login:', error); // Loggea el error en la consola
    }
  };

  // Función para manejar el click en el overlay del modal y cerrar el modal si se hace click fuera del contenido
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(); // Cierra el modal de inicio de sesión
    }
  };

  // Si isOpen es falso, no renderiza nada
  if (!isOpen) return null;

  // Renderizado del componente de modal de inicio de sesión
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick} // Maneja el click en el overlay para cerrar el modal
    >
      <div className="relative bg-gray-900 p-8 rounded-lg text-white w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-2xl mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>} {/* Muestra el mensaje de error si existe */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              className="w-full text-black p-2 border"
              style={{ borderRadius: '10px' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Actualiza el estado del nombre de usuario
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 text-black border"
              style={{ borderRadius: '10px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de la contraseña
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
            Login
          </button>
        </form>
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500 text-4xl" style={{ lineHeight: '0' }}>
          <ion-icon name="close-outline"></ion-icon> {/* Botón de cierre del modal */}
        </button>
      </div>
    </div>
  );
}

export default LoginModal;