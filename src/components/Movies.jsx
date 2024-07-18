import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";

function Movies() {
  const [genres, setGenres] = useState([]); // Almacena los géneros de películas
  const [selectedGenre, setSelectedGenre] = useState(null); // Almacena el género seleccionado para filtrar películas
  const [displayedMovies, setDisplayedMovies] = useState([]); // Películas mostradas en la página actual
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el acordeón de géneros está abierto o cerrado
  const [currentPage, setCurrentPage] = useState(1); // Página actual de la paginación
  const [placeholder, setPlaceholder] = useState("Genres"); // Placeholder para el menú de géneros
  const [allMovies, setAllMovies] = useState([]); // Almacena todas las películas obtenidas
  const [filteredMovies, setFilteredMovies] = useState([]); // Almacena películas filtradas por género

  // Efectos para cargar géneros y películas cuando cambian currentPage o selectedGenre
  useEffect(() => {
    fetchGenres();
    fetchMovies();
  }, [currentPage, selectedGenre]);

  // Función para obtener los géneros de películas desde la API
  const fetchGenres = async () => {
    try {
      const response = await fetch("https://api-outdbox.onrender.com/api/genres");
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  // Función para obtener las películas desde la API y aplicar filtros por género
  const fetchMovies = async () => {
    try {
      let filteredMoviesList = [];
      const seenMovieIds = new Set(); // Set para rastrear las películas únicas
  
      for (let page = 1; page <= 5; page++) {
        const response = await fetch(`https://api-outdbox.onrender.com/api/now_playing_movies?page=${page}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
  
        let moviesToAdd = [...data];
        if (selectedGenre) {
          moviesToAdd = moviesToAdd.filter(movie => movie.genre_ids.includes(selectedGenre));
        }
  
        // Filtrar películas duplicadas, me estaba dando error jasdjasd
        moviesToAdd.forEach(movie => {
          if (!seenMovieIds.has(movie.id)) {
            seenMovieIds.add(movie.id);
            filteredMoviesList.push(movie);
          }
        });
      }
  
      setAllMovies(filteredMoviesList);
      setFilteredMovies(filteredMoviesList); // Inicialmente, todas las películas están en la lista filtrada
  
      const startIndex = (currentPage - 1) * 20;
      const endIndex = startIndex + 20;
      setDisplayedMovies(filteredMoviesList.slice(startIndex, endIndex));
  
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };
  
  
  // Función para manejar la selección de género y actualizar el estado
  const handleGenreSelect = (genreId, genreName) => {
    setSelectedGenre(genreId);
    setPlaceholder(genreName);
    setIsOpen(false);
    setCurrentPage(1); // Reinicia a la primera página después de filtrar
  };
  
  // Función para cambiar a una página específica de la paginación
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Hace scroll suave al cambiar de página
  };
  
  // Función para limpiar la selección de género y resetear la paginación
  const clearGenreSelection = () => {
    setSelectedGenre(null);
    setPlaceholder("Genres");
    setCurrentPage(1);
  };

  // Función para alternar el estado de isOpen, que controla si el acordeón de géneros está abierto o cerrado
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };


  return (
    <>
      <Nav />
      <div className="p-28 bg-gray-900 min-h-screen relative">
        {/* Acordeón de géneros */}
        <div className="absolute z-10" style={{ width: "12em" }}>
          <button
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300"
            onClick={toggleAccordion}
          >
            <span>{placeholder}</span> {/* Placeholder del menú acordeón */}
            <div className="flex items-center">
              {selectedGenre && (
                <span
                  className="text-red-500 cursor-pointer mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearGenreSelection();
                  }}
                >
                  ×
                </span>
              )}
              <svg
                className={`w-4 h-4 ${isOpen ? "-rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>
          {/* Lista de géneros */}
          {isOpen && (
            <div className="mt-2 max-h-48 overflow-y-auto p-2 bg-gray-800 rounded shadow">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  className={`block px-4 py-2 mt-1 text-white rounded ${selectedGenre === genre.id ? "bg-gray-700" : "hover:bg-gray-700"}`}
                  onClick={() => handleGenreSelect(genre.id, genre.name)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de películas filtradas por género */}
        <div className="pt-16 flex flex-wrap justify-center">
          {displayedMovies.length > 0 ? (
            displayedMovies.map((movie) => (
              <div key={movie.id} className="mb-6 w-48 p-2 transform scale-100 transition-transform duration-500 ease-in-out hover:scale-110">
                <Link to={`/movie/${movie.id}`}>
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-64 object-cover rounded-lg" />
                  <h3 className="mt-2 text-lg text-white">{movie.title}</h3>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-white">No hay películas disponibles para este género</div>
          )}
        </div>

        {/* Navegación numérica */}
        <div className="flex justify-center mt-4">
          {[...Array(5)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index + 1)}
              className={`mx-1 px-3 py-1 bg-gray-800 text-white rounded ${currentPage === index + 1 ? "bg-gray-600" : "hover:bg-gray-700"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default Movies;