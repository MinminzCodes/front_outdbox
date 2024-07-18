import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from './Nav'; // Componente de navegación
import LoginModal from './LoginModal'; // Modal de login
import { AuthContext } from './AuthContext'; // Contexto de autenticación

function MovieDetails() {
  const { id } = useParams(); // Obtiene el parámetro 'id' de la URL
  const { isAuthenticated, userId, login } = useContext(AuthContext); // Utiliza el contexto de autenticación

  // Estados locales para almacenar la información de la película, errores, favoritos, 
  //calificación, modal de login, recomendaciones, modal de reseñas y la reseña del usuario
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [review, setReview] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Hook de efecto para cargar datos al montar el componente y cuando cambian las dependencias id, isAuthenticated o userId
  useEffect(() => {
    fetchMovieDetails(id); // Cargar detalles de la película al montar el componente
    fetchRecommendations(id);  // Cargar recomendaciones de películas relacionadas
    if (isAuthenticated) {
      fetchUserReview(id, userId); // Cargar la review del usuario si esta logado
    }
  }, [id, isAuthenticated, userId]);

  // Función para cargar detalles de la película desde el backend
  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(`https://api-outdbox.onrender.com/api/movie/${movieId}`); // Endpoint en el backend para obtener detalles de la película desde TMDb
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setMovie(data); // Guarda los detalles de la película en el estado
    } catch (error) {
      setError(error.message);
      console.error("Error fetching movie details:", error);
    }
  };

  // Función para cargar recomendaciones de películas relacionadas desde la API
  const fetchRecommendations = async (movieId) => {
    try {
      const response = await fetch(`https://api-outdbox.onrender.com/api/movie/${movieId}/recommendations`); // Endpoint en el backend para obtener recomendaciones de peliculas
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setRecommendations(data.results.slice(0, 5)); // Guarda las recomendaciones en el estado, y el slice es para mostrar 5 
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

// Función para cargar la review del usuario si existe
//Lo hice solo con movieId porque en este caso solo tengo un usuario, pero lo ideal sería tener userId tambien 
const fetchUserReview = async (movieId) => {
  try {
    const response = await fetch(`https://api-outdbox.onrender.com/reviews`); // Endpoint en el backend para obtener la reseña del usuario
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const reviews = await response.json();

    // Busca la review del usuario basada en el movieId
    const foundReview = reviews.find(review => review.movieId === movieId);

    if (foundReview) {
      setRating(foundReview.rating);    
      setFavorite(foundReview.favorite); 
      setUserReview(foundReview);// Actualizar el estado con la reviews encontrada
    } else {
      setUserReview(null); // Establece el estado como null si no hay review
    }
  } catch (error) {
    console.error('Error fetching user review:', error);
  }
};
  
 // Función para manejar el cambio de favoritos 
const handleFavoriteToggle = () => {
  if (!isAuthenticated) {
    setIsModalOpen(true);
  } else {
    if (!userReview) {
      setFavorite(!favorite); // Cambia el estado local de favorite solo si no hay review del usuario
    }
  }
};

// Función que maneja el cambio de calificación
const handleRating = (value) => {
  if (!isAuthenticated) {
    setIsModalOpen(true);
  } else {
    if (!userReview) {
      setRating(prevRating => (prevRating === value ? 0 : value)); // Cambia el estado local de rating solo si no hay review del usuario
    }
  }
};

  //Funcion que maneja el inicio de sesion exitoso
  const handleLoginSuccess = (userData) => {
    login(userData); // Llama a la función de login del contexto de autenticación para establecer la sesión
    setIsModalOpen(false); // Cierra el modal de inicio de sesión
  };

  //Funcion que maneja el modal para añadir review
  const handleAddReview = () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setIsReviewModalOpen(true); // Abre el modal para agregar una review
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario de recargar la página
    //Verificamos si los campos requeridos estan completos
    if (!userId || !id || !review || rating === 0) {
      setReviewError('Please add a valid review'); // Muestra un error en el modal si falta algún campo
      return; // Sale de la función si falta algún campo
    }

    try {
      // Prepara los datos de la review para enviar
      const reviewData = {
        userId: userId, // ID del usuario
        movieId: id, // ID de la película
        review: review, // Texto de la review
        rating: rating, // Calificación de la película
        favorite: favorite, // Estado de favorito
      };

      // Envía los datos de la reseña al servidor
      const response = await fetch('https://api-outdbox.onrender.com/reviews/nueva', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(reviewData), 
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        // Si la reseña se envió correctamente, cierra el modal de reseña y reinicia los estados
        setIsReviewModalOpen(false); // Cierra el modal de reseña
        setReview(''); // Reinicia el texto de la reseña
        setRating(0); // Reinicia la calificación
        setFavorite(false); // Reinicia el estado de favorito
      }else{
        const errorData = await response.json();
        setReviewError(errorData.error); // Muestra el mensaje de error al usuario
        console.error('Error en la reseña:', errorData.error);
      }
    } catch (error) {
      setReviewError('Error submitting review:', error); // Establece el error si ocurre un problema al enviar la reseña
      console.error('Error in the review:', error); // Muestra un error en la consola si algo sale mal
    }
  };
  //Scroll hacia arriba de pagina
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  //Error si no carga la pagina
  if (error) {
    return (
      <>
        <Nav />
        <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }
  //Pagina de cargandoo
  if (!movie) {
    return (
      <>
        <Nav />
        <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

   // Determina si mostrar el botón "Add Review" basado en la existencia de userReview
   const showAddReviewButton = !userReview;

   //Para resetear los valores de favorito y estrellas cuando le demos a alguna pelicula recomendada 
   const resetRatingAndFavorite = () => {
    setRating(0);
    setFavorite(false);
  };
  

  return (
    <>
      {/* El componente de navegacion */}
      <Nav />
      <div className="w-full relative flex flex-col items-center bg-gray-900">
        {/* Imagen de fondo de la pelicula */}
        <div className="w-full lg:w-4/5">
          <img className="w-full lg:h-125 object-cover object-[0_35%] rounded-b-lg" style={{ paddingTop: "40px"}} src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.original_title} />
        </div>
        <div className="flex flex-col lg:flex-row items-center w-11/12 lg:w-3/4 lg:mt-8 relative lg:bottom-24 mt-8">
          <div className="mb-8 lg:mb-0 lg:mr-8">
            {/* Poster de la película */}
            <img className="w-48 h-72 lg:w-72 lg:h-96 object-cover rounded-lg shadow-[rgba(0,0,0,0.86)_0px_22px_40px_6px]" src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} alt={movie.original_title} />
          </div>
          <div className="text-white flex flex-col lg:h-112 justify-between w-full lg:w-auto">
            <div className="mb-2" style={{ textShadow: "0px 0px 5px #000000"}}>
              <div className="font-semibold text-3xl lg:text-6xl pb-2">{movie.original_title}</div>
              <div>{movie.tagline}</div>
              <div>
                {Math.round(movie.vote_average * 10) / 10} <ion-icon name="star"></ion-icon>
                <span className="ml-2">{`(${movie.vote_count}) votes`}</span>
              </div>
              <div>{`${movie.runtime} mins`}</div>
              <div>{`Release date: ${movie.release_date}`}</div>
              <div className="my-5">
                {/* Géneros de la película */}
                {movie.genres.map((genre) => (
                  <span className="p-1.5 border-2 border-white rounded-2xl mr-2 lg:mr-4" key={genre.id}>{genre.name}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center text-xl lg:text-3xl space-x-2 lg:space-x-4">
                {/* Sistema de calificación con estrellas */}
                {[1, 2, 3, 4, 5].map(value => (
                  <ion-icon
                    key={value}
                    name={value <= rating ? "star" : "star-outline"}
                    className={`text-yellow-400 cursor-pointer ${userReview ? 'pointer-events-none opacity-50' : ''}`} 
                    onClick={() => handleRating(value)}
                  ></ion-icon>
                ))}
                {/* Favoritos */}
                <ion-icon
                  name={favorite ? "heart" : "heart-outline"}
                  className={`text-red-500 cursor-pointer ${userReview ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={handleFavoriteToggle}
                ></ion-icon>
            </div>
            <div className="my-8 flex-grow overflow-y-auto max-h-60 lg:max-h-full" style={{width:"100%", maxWidth: "40em"}}>
              <div className="text-2xl mb-5 font-semibold flex items-center relative">Synopsis</div>
              <div>{movie.overview}</div>
            </div>
            {userReview === null && ( // Mostrar el botón solo si no hay revisión del usuario
              <button className="border-2 border-white rounded-2xl hover:bg-blue-900 text-white font-bold py-2 px-4 mt-4 lg:mt-0" onClick={handleAddReview}>
                Add Review
              </button>
            )}
            {isReviewModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="bg-gray-900 p-8 rounded-lg z-50">
                  <h2 className="text-2xl font-semibold mb-4">Add your thoughts here...</h2>
                  {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
                  <form onSubmit={handleSubmitReview}>
                    <textarea
                      className="w-full h-32 border text-black rounded-lg p-2 mb-4"
                      placeholder="Did you enjoy it...?"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setIsReviewModalOpen(false)}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-11/12 lg:w-4/5 mb-6 lg:mt-12">
          <h2 className="text-white text-2xl mb-4">Recommended Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Muestra las películas recomendadas */}
            {recommendations.map((movie) => (
              <div key={movie.id} className="flex flex-col items-center transform scale-100 transition-transform duration-500 ease-in-out hover:scale-110">
                <Link to={`/movie/${movie.id}`} onClick={() => { scrollToTop(); resetRatingAndFavorite(); }}>
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-lg mb-2 text-white" />
                </Link>
                <div className="text-white text-center">{movie.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLogin={handleLoginSuccess} />
    </>
  );
}

export default MovieDetails;