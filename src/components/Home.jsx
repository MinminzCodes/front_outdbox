import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";

function Home() {
  const imageUrlBase = "https://image.tmdb.org/t/p/w500";
  const slideInterval = 5000; // Tiempo de espera para pasar al siguiente slide

  const [movies, setMovies] = useState([]); // Estado para almacenar las películas populares
  const [activeIndex, setActiveIndex] = useState(0); // Estado para mantener el índice del slide activo

  useEffect(() => {
    // Llamada al backend para obtener las películas populares de la api
    fetch('https://api-outdbox.onrender.com/api/popular_movies')
      .then(response => response.json())
      .then(data => {
        setMovies(data); // Establece las películas obtenidas desde el backend en el estado
      })
      .catch(error => {
        console.error("Error fetching movies:", error);
      });
  }, []);

  // Función para avanzar al siguiente slide del carrusel
  const nextSlide = () => {
    setActiveIndex(prevIndex => (prevIndex + 1) % movies.length);
  };

  // Función para retroceder al slide anterior del carrusel
  const prevSlide = () => {
    setActiveIndex(prevIndex => (prevIndex - 1 + movies.length) % movies.length);
  };

  useEffect(() => {
    if (movies.length > 0) {
      // Inicia un intervalo para cambiar automáticamente de slide cada slideInterval milisegundos
      const intervalId = setInterval(nextSlide, slideInterval);
      return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }
  }, [movies]); // Reinicia el intervalo cuando cambian las películas

  return (
    <>
      <Nav />
      <div className="pt-20 bg-gray-900 text-white">
        <div className="container mx-auto mt-0">
          {/* Carrusel */}
          <div className="bg-cover" style={{ backgroundImage: `url(${imageUrlBase}${movies[activeIndex]?.backdrop_path})`, height: "35rem", transition: "background-image 0.4s ease" }}>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center backdrop-blur-md" style={{ height: "40rem" }}>
              {/* Enlace a la página de detalles de la película */}
              <Link to={`/movie/${movies[activeIndex]?.id}`}>
                {/* Imagen de la película en el carrusel */}
                <img className="w-48 p-4 transform scale-100 transition-transform duration-500 ease-in-out hover:scale-110" style={{ borderRadius: '25px' }} src={`${imageUrlBase}${movies[activeIndex]?.poster_path}`} alt={movies[activeIndex]?.title} />
              </Link>
              {/* Título de la película en el carrusel */}
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">{movies[activeIndex]?.title}</h1>
              {/* Resumen de la película en el carrusel */}
              <p className="text-sm sm:text-lg max-w-2xl text-center p-1">{movies[activeIndex]?.overview}</p>
            </div>
          </div>

          {/* Botones de navegación del carrusel */}
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full" onClick={prevSlide}>
            &#10094; {/* Símbolo de flecha izquierda */}
          </button>
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full" onClick={nextSlide}>
            &#10095; {/* Símbolo de flecha derecha */}
          </button>

          {/* Indicadores del Carrusel */}
          <div className="flex justify-center mt-4">
            {/* Botones de navegación para cada película en el carrusel */}
            {movies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                className={`mx-1 w-3 h-3 rounded-full border-2 border-white ${index === activeIndex ? 'bg-white' : 'bg-transparent'}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Slide ${index + 1}`}>
              </button>
            ))}
          </div>
        </div>

        {/* Sección de películas populares */}
        <div className="p-4">
          <h2 className="text-2xl mb-4 flex justify-center font-bold pb-4">Popular Movies</h2>
          <div className="flex flex-wrap justify-center">
            {/* Lista de películas populares */}
            {movies.map(movie => (
              <div key={movie.id} className="mb-6 w-48 p-2 transform scale-100 transition-transform duration-500 ease-in-out hover:scale-110">
                {/* Enlace a la página de detalles de la película */}
                <Link to={`/movie/${movie.id}`}>
                  {/* Imagen de la película */}
                  <img src={`${imageUrlBase}${movie.poster_path}`} alt={movie.title} className="w-full h-64 object-cover rounded-lg " />
                  {/* Título de la película */}
                  <h3 className="mt-2 text-lg">{movie.title}</h3>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;