import "./App.css";
import Layout from "./pages/layout/Layout";
import Home from "./pages/home/Home";
import TicTacToe, {loader as TicTacToeLoader} from "./pages/tictactoe/Tictactoe";
import Nick, {action as nickAction} from "./pages/nick/Nick";
import Erro from "./pages/erro/Erro";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Link, Route } from "react-router-dom";


const routers = createBrowserRouter(createRoutesFromElements(
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/nick/:code/:erro?" errorElement={<Erro />} action={nickAction} element={<Nick />} />
    <Route path="/tictactoe/:code/:username" errorElement={<Erro />} element={<TicTacToe />} loader={TicTacToeLoader} />
  </Route>
));

function App() {
  return (
    <RouterProvider router={routers} />
  );
}

export default App;
