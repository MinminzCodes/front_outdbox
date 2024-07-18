import React, { useState, useEffect, useContext } from 'react';
import Nav from './Nav';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import { AuthContext } from './AuthContext'; // Importa el contexto de autenticación

function FavoriteMovie({ id, title, stars, isFavorite, review, posterUrl, movieId ,onRatingChange, onSaveReview, onToggleFavorite, onDeleteReview }) {
  const [editing, setEditing] = useState(false); // Estado para controlar el modo de edición
  const [tempReview, setTempReview] = useState(review); // Estado temporal para la review
  const [tempStars, setTempStars] = useState(stars); // Estado temporal para las estrellitas de la valoración
  const [tempIsFavorite, setTempIsFavorite] = useState(isFavorite); // Estado temporal para el favorito
  const [error, setError] = useState(null); // Estado para el mensaje de error



  // Función para alternar entre el modo de edición
  const handleEditToggle = () => {
    setEditing(!editing);
  };

  // Función para guardar la review editada
  const handleSaveReview = () => {
    if (tempReview.trim() === '') {
      setError('You need to write something!'); // Mostrar mensaje de error si la review está vacía
      return;
    }

    onSaveReview(id, tempReview.trim());
    setEditing(false);
    setError(null); // Reiniciar el mensaje de error al guardar la review
  };

  // Función para alternar el estado de favorito
  const handleToggleFavorite = () => {
    setTempIsFavorite(!tempIsFavorite);
    onToggleFavorite(id, !tempIsFavorite);
  };

  // Función para cambiar la valoración
  const handleRatingChange = (value) => {
    setTempStars(value);
    onRatingChange(id, value);
  };

  // Función para eliminar la review
  const handleDeleteReview = () => {
    onDeleteReview(id);
    setEditing(false); // Salir del modo de edición después de eliminar
  };

  // Función para hacer scroll hacia arriba suavemente
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-4 flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
      <div className="flex flex-col lg:flex-row items-center space-x-0 lg:space-x-4 mb-4 lg:mb-8">
        <div className="w-24 h-36 lg:w-32 lg:h-48 xl:w-48 xl:h-64 object-cover rounded-lg shadow-[rgba(0,0,0,0.86)_0px_22px_40px_6px]">
        {/* Enlace a la página de detalles de la película */}
        <Link to={`/movie/${movieId}`} onClick={scrollToTop}>
          <img src={posterUrl} alt={title} className="w-full h-full rounded-lg transform scale-100 transition-transform duration-500 ease-in-out hover:scale-110" />
        </Link>
        </div>
        <div className="flex flex-col flex-1 mt-4 lg:mt-0 ml-0 lg:ml-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
            <span className="text-lg font-semibold mr-4">{title}</span>
            <div className="flex flex-wrap items-center space-x-4">
              {/* Ícono de corazoncito para marcar como favorito */}
              <ion-icon
                name={tempIsFavorite ? 'heart' : 'heart-outline'}
                className={`text-red-500 cursor-pointer ${editing ? 'opacity-50' : ''}`}
                onClick={editing ? handleToggleFavorite : null}
              ></ion-icon>
              {/* Íconos de estrella para la valoración */}
              {[1, 2, 3, 4, 5].map(value => (
                <ion-icon
                  key={value}
                  name={value <= tempStars ? 'star' : 'star-outline'}
                  className={`text-yellow-400 cursor-pointer ${editing ? 'opacity-50' : ''}`}
                  onClick={editing ? () => handleRatingChange(value) : null}
                ></ion-icon>
              ))}
              {/* Botón para editar o guardar la review */}
              <button
                className="border-2 border-white rounded-2xl hover:bg-blue-900 text-white font-bold py-2 px-4 mt-4 lg:mt-0"
                onClick={editing ? handleSaveReview : handleEditToggle}
              >
              {/* Botón para eliminar la review (solo visible en modo edición) */}
              {editing ? 'Save' : 'Edit'}
              </button>
              {editing && (
                <button
                  className="border-2 border-red-500 rounded-2xl hover:bg-red-500 text-white font-bold py-2 px-4 mt-4 lg:mt-0"
                  onClick={handleDeleteReview}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div>
            {/* Renderizado del campo de review o la review actual */}
            {editing ? (
              <form className="mt-4">
                <input
                  type="text"
                  style={{ borderBottom: '1px dashed white' }}
                  className="border-none p-1 w-full bg-transparent"
                  value={tempReview}
                  onChange={(e) => setTempReview(e.target.value)}
                />
              {error && <p className="text-red-500 mt-1">{error}</p>} {/* Mostrar mensaje de error si existe */}
              </form>
            ) : (
              <p className="mt-4">{review}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Función asíncrona para editar la review en el backend
async function editarReview(id, review, rating, favorite) {
  try {
    const response = await fetch(`https://api-outdbox.onrender.com/reviews/actualizar/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review, rating, favorite }),
    });

    if (!response.ok) {
      throw new Error('Failed to update review');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating review:', error);  
  }
}
// Función asíncrona para borrar la review en el backend
async function borrarReview(id) {
  try {
    const response = await fetch(`https://api-outdbox.onrender.com/reviews/borrar/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete review');
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting review:', error);
  }
}

// Componente principal para mostrar las reviews favoritas del usuario
function Favorites() {
  const [favorites, setFavorites] = useState([]); // Estado para almacenar las reviews favoritas
  const { isAuthenticated } = useContext(AuthContext); // Acceso al estado de autenticación desde el contexto
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la apertura del modal de inicio de sesión
  const [showFavorites, setShowFavorites] = useState(true); // Estado para mostrar o no las reviews marcadas como favoritas
  const [showNonFavorites, setShowNonFavorites] = useState(true); // Estado para mostrar o no las reviews no favoritas
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar como se abre el acordeón de filtros

  // Efecto para cargar las reviews favoritas y los detalles de las películas 
  useEffect(() => {
    const fetchMovieDetailsAndReviews = async () => {
      try {
        // Obtener las reviews desde el backend
        const responseReviews = await fetch('https://api-outdbox.onrender.com/reviews'); // URL del endpoint para obtener reviews
        if (!responseReviews.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewsData = await responseReviews.json();
      
        // Obtener detalles de películas desde TMDb y combinar con las reviews
        const updatedFavorites = await Promise.all(reviewsData.map(async review => {
          try {
            const responseMovie = await fetch(`https://api-outdbox.onrender.com/api/movie/${review.movieId}`);
            if (!responseMovie.ok) {
              throw new Error(`Failed to fetch movie details for ID ${review.movieId}`);
            }
            const movieData = await responseMovie.json();
            // Construir objeto con datos combinados de la review y la película
            return {
              id: review.id,
              movieId: review.movieId,
              title: movieData.title,
              stars: review.rating,
              isFavorite: review.favorite,
              review: review.review,
              posterUrl: `https://image.tmdb.org/t/p/original${movieData.poster_path}`
            };
          } catch (error) {
            console.error(`Error fetching details for movie ID ${review.movieId}:`, error);
            // En caso de error, retornar un objeto con datos básicos
            return {
              id: review.id,
              movieId: review.movieId,
              title: "Movie Title Not Found",
              stars: review.rating,
              isFavorite: review.favorite,
              review: review.review,
              posterUrl: ''
            };
          }
        }));
  
        setFavorites(updatedFavorites); // Actualizar el estado con las reviews combinadas
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchMovieDetailsAndReviews(); // Llamar a la función al montar el componente
  }, []); // El array vacío [] asegura que el efecto se ejecute solo una vez al montar el componente

  // Función para manejar el click en el botón de inicio de sesión
  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  // Función para manejar el cambio de valoración
  const handleRatingChange = async (id, value) => {
    try {
      const updatedFavorites = favorites.map(movie => {
        if (movie.id === id) {
          return { ...movie, stars: value };
        }
        return movie;
      });
      setFavorites(updatedFavorites); // Actualizar el estado local con la nueva valoración
  
      const movie = updatedFavorites.find(movie => movie.id === id);
      await editarReview(id, movie.review, value, movie.isFavorite); // Llamar a la función para actualizar la review en el backend
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };
  
  // Función para manejar el cambio de estado de favorito
  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      const updatedFavorites = favorites.map(movie => {
        if (movie.id === id) {
          return { ...movie, isFavorite };
        }
        return movie;
      });
      setFavorites(updatedFavorites); // Actualizar el estado local con el nuevo estado de favorito
  
      const movie = updatedFavorites.find(movie => movie.id === id);
      await editarReview(id, movie.review, movie.stars, isFavorite); // Llamar a la función para actualizar la review en el backend
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };
  
  // Función para manejar el guardado de una review
  const handleSaveReview = async (id, newReview) => {
    try {
      const updatedFavorites = favorites.map(movie => {
        if (movie.id === id) {
          return { ...movie, review: newReview };
        }
        return movie;
      });
      setFavorites(updatedFavorites); // Actualizar el estado local con la nueva review
  
      const movie = updatedFavorites.find(movie => movie.id === id);
      await editarReview(id, newReview, movie.stars, movie.isFavorite); // Llamar a la función para actualizar la review en el backend
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };
  
  // Función para manejar la eliminación de una review
  const handleDeleteReview = async (id) => {
    try {
      const updatedFavorites = favorites.filter(movie => movie.id !== id); // Filtrar la review eliminada
      setFavorites(updatedFavorites); // Actualizar el estado local sin la review eliminada
      await borrarReview(id); // Llamar a la función para eliminar la review en el backend
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };
  
  // Función para alternar el estado del acordeón de filtros
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // Función para manejar el cambio de filtro (favoritos/no favoritos)
  const handleFilterChange = (filterType) => {
    if (filterType === 'favorites') {
      setShowFavorites(!showFavorites);
    } else if (filterType === 'nonFavorites') {
      setShowNonFavorites(!showNonFavorites);
    }
  };

  // Filtrar las reviews según el estado de los filtros
  const filteredFavorites = favorites.filter(movie => {
    if (showFavorites && movie.isFavorite) return true;
    if (showNonFavorites && !movie.isFavorite) return true;
    return false;
  });
  
  return (
    <>
     <Nav />
      <div className="text-white p-4 sm:p-8 md:p-16 lg:p-28 bg-gray-900 min-h-screen flex flex-col items-center justify-center" style={{paddingTop : "100px"}}>
        {/* Si el usuario está autenticado */}
        {isAuthenticated ? (
          <>
            {/* Botón para abrir el acordeón de filtros */}
            <div className="w-full mb-4">
              <button
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300"
                onClick={toggleAccordion}
              >
                <span>Filter Reviews</span>
                <div className="flex items-center">
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
              {/* Contenido del acordeón de filtros */}
              {isOpen && (
                <div className="bg-gray-800 text-white p-4 rounded shadow mt-2">
                  <label className="flex items-center mb-2">
                    {/* Checkbox para mostrar favoritos */}
                    <input
                      type="checkbox"
                      checked={showFavorites}
                      onChange={() => handleFilterChange('favorites')}
                      className="mr-2"
                    />
                    Show Favorites
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showNonFavorites}
                      onChange={() => handleFilterChange('nonFavorites')}
                      className="mr-2"
                    />
                    Show Non-Favorites
                  </label>
                </div>
              )}
            </div>
            {/* Título de la sección de reviews */}
            <h2 className="text-2xl font-bold mb-4">Your reviews:</h2>
            {/* Si hay reviews filtradas, mostrarlas */}
            {filteredFavorites.length > 0 ? (
              <ul className="divide-y divide-gray-700 w-full">
                {/* Mapear y mostrar cada review */}
                {filteredFavorites.map(movie => (
                  <FavoriteMovie
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    stars={movie.stars}
                    isFavorite={movie.isFavorite}
                    review={movie.review}
                    posterUrl={movie.posterUrl}
                    movieId={movie.movieId}
                    onRatingChange={handleRatingChange}
                    onSaveReview={handleSaveReview}
                    onToggleFavorite={handleToggleFavorite}
                    onDeleteReview={handleDeleteReview}
                  />
                ))}
              </ul>
            ) : (
              <p>You haven't made any reviews yet.</p>
            )}
          </>
        ) : (
          // Si el usuario no está autenticado, mostrar mensaje y botón de inicio de sesión 
          <div className="flex flex-col items-center">
            <p className="text-lg mb-4">To see your reviews, log in please.</p>
            <button onClick={handleLoginClick} className="bg-gray-800 text-white font-display py-2 px-6 rounded hover:bg-gray-400 duration-500">
              Login
            </button>
          </div>
        )}
        {/* Modal de inicio de sesión */}
        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLogin={handleLoginSuccess} />
      </div>
    </>
  );
}

export default Favorites;