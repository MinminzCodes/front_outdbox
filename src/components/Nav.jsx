import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import { AuthContext } from "./AuthContext"; // Ruta del contexto de autenticacion

function Nav() {
    // Obtiene el estado de autenticación y la función de logout del contexto de autenticación
    const { isAuthenticated, logout } = useContext(AuthContext);
    //Manejamos la visibilidad del menú, modal de login y el menú de perfil
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    const profileMenuRef = useRef(null);

    // Hook de efecto para manejar clicks fuera del menú de perfil
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false); // Cierra el menú de perfil si se hace click fuera
            }
        };
        // Añade el listener de click al documento
        document.addEventListener("click", handleClickOutside);
        // Limpia el listener de click cuando el componente se desmonta
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Función para hacer scroll hacia arriba de la página
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    //Abre modal de Login
    const handleLoginClick = () => {
        setIsModalOpen(true);
    };
    //Maneja el logout en base al contexto de la autenticación
    const handleLogout = async () => {
        try {
            await logout(); 
            setShowProfileMenu(false); //Cierra el menu de perfil despues del logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    // Alterna la visibilidad del menú de perfil, aunque esto creo que se podria quitar :'v
    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    return (
        <nav className="shadow-md w-full font-display fixed top-0 left-0 z-20">
            <div className="md:flex items-center justify-between bg-zinc-100 py-4 md:px-10 px-7">
                <div className="flex items-center justify-center w-full md:w-48">
                    <div className="w-48">
                        {/* Cuando le damos al logo nos lleva al Home */}
                       <Link to="/" onClick={scrollToTop}><img className="h-full" src="../src/img/logo_horizontal_diseno.png" alt="Imagen logotipo" /></Link>
                    </div>
                </div>
                {/* Menu de hamburguesa  */}
                <div onClick={() => setIsOpen(!isOpen)} className="text-4xl absolute right-8 top-3 cursor-pointer md:hidden">
                    <ion-icon name={isOpen ? 'close' : 'menu'}></ion-icon>
                </div>
                {/* Los componentes del menu de navegacion */}
                <ul className={`md:flex md:items-center md:pb-0 pb-10 absolute md:static bg-zinc-100 md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 transition-all duration-700 ease-in ${isOpen ? 'top-10 opacity-100' : 'top-[-490px]'}`}>
                    <li className="ml-8 text-xl md:my-0 my-7"><Link to="/" onClick={scrollToTop} className="text-gray-800 hover:text-gray-400 duration-500">Home</Link></li>
                    <li className="ml-8 text-xl md:my-0 my-7"><Link to="/movies" onClick={scrollToTop} className="text-gray-800 hover:text-gray-400 duration-500">Movies</Link></li>
                    <li className="ml-8 text-xl md:my-0 my-7"><Link to="/favorites" onClick={scrollToTop} className="text-gray-800 hover:text-gray-400 duration-500">Reviews</Link></li>
                    {isAuthenticated ? (
                        <li className="ml-8">
                            {isOpen ? (
                                // En el menu desplegable al darle click al icono de perfil, directamente cierras sesion
                                <button onClick={handleLogout} className="text-gray-800 hover:text-gray-400 duration-500">
                                    <ion-icon name="person-circle-outline" size="large"></ion-icon>
                                </button>
                            ) : (
                                // Muestra el menú de perfil cuando el menú no está abierto en modo móvil
                                <div className="relative" ref={profileMenuRef}>
                                    <button onClick={toggleProfileMenu} className="text-gray-800 hover:text-gray-400 duration-500">
                                        <ion-icon name="person-circle-outline" size="large"></ion-icon>
                                    </button>
                                    {showProfileMenu && (
                                        <ul className="absolute right-0 mt-2 bg-white shadow-md rounded-md">
                                            {/* Cuando al darle al me icono del perfil, cuando estamos fuera del menu hamburguesa, de despliega un menu con Logout */}
                                            <li>
                                                <button onClick={handleLogout} className="block px-4 py-2 text-gray-800 hover:bg-gray-200 hover:rounded-md w-full text-left">Logout</button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            )}
                        </li>
                    ) : (
                         // Muestra el botón de login si el usuario no está autenticado
                        <li className="ml-8">
                            <button onClick={handleLoginClick} className="bg-gray-800 text-white font-display py-2 px-6 rounded hover:bg-gray-400 duration-500">
                                Login
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            {/* Modal de login */}
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
}

export default Nav;