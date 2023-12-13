import Nickform from "./components/NickForm";

export {action} from "./components/NickForm";

export default function Nick(){
    return(
        <div className="container-fluid d-flex justify-content-center" style={{ height: "100vh"}}>
            <Nickform />
        </div>
    )
}