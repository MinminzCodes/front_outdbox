import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import Home from './components/Home'
import Movies from './components/Movies'
import MovieDetails from './components/MovieDetails'
import Favorites from './components/Favorites'
import Error from './components/Error'
import { AuthProvider } from './components/AuthContext';


//Creamos nuestro router >:D
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />
  },
  {
    path: "/movies",
    element: <Movies />
  },
  {
    path: "/movie/:id",
    element: <MovieDetails />    
  },
  {
    path: "/favorites",
    element: <Favorites />
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Contexto de la autenticacion */}
    <AuthProvider> 
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
