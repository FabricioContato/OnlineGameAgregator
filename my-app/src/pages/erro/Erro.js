import ErroMessage from "./components/ErroMessage";
import { Link } from "react-router-dom";

export default function Erro(){
    return(
        <div className="container">
            <ErroMessage />
            <Link className="btn btn-primary" to="/">Home page</Link>
        </div>
    );
}