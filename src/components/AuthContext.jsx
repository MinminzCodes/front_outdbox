import React, { createContext, useState } from 'react';

// Creación del contexto de autenticación
export const AuthContext = createContext();

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estados locales para el estado de autenticación y el userId
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  // Función para iniciar sesión
  const login = (userData) => {
    setIsAuthenticated(true); // Establece isAuthenticated como verdadero al iniciar sesión
    setUserId(userData.userId); // Establece el userId desde los datos del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false); // Establece isAuthenticated como falso al cerrar sesión
    setUserId(null); // Reinicia el userId a null al cerrar sesión
  };

  // Proveedor del contexto que envuelve a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children} {/* Renderiza todos los componentes hijos dentro del proveedor de contexto */}
    </AuthContext.Provider>
  );
};


//Este componente lo use basicamente para que la sesion se me quedase en todos los componentes y se sincronizara, porque antes de esto si iniciaba
//sesión en la ruta de favorites por ejemplo no se sincronizaba con Nav y en nav aun te salia el boton de Login, y si ibas por la diferentes rutas salias de la sesion
//Asi que esto me ayudo a solucionar todo eso :D