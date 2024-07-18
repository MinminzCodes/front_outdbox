import errorImage from '../img/error_img.jpg';
import { Link } from "react-router-dom";

//Bueno este componente es por si hay algun error y pones una ruta que no es jeje
function Error(){
    return(
        <div className="pl-6 pt-8 justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${errorImage})` }}>
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="relative z-10">
                <h1 className="w-64 mb-4"><Link to="/"><img src="../src/img/formas_diseno.png" alt="Imagen Logotipo" /></Link></h1>
                <p className="text-white text-lg w-5/12">Sorry, we can't find the page you've requested. Perhaps you imagined it? Please contact us if the problem persists.</p>
            </div>
        </div>
    )
}

export default Error