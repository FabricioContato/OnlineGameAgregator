import "./App.css";
import Layout from "./pages/layout/Layout";
import Home, {action as HomeAction} from "./pages/home/Home";
import TicTacToe, {loader as TicTacToeLoader} from "./pages/tictactoe/Tictactoe";
import Nick, {action as nickAction} from "./pages/nick/Nick";
import Checkers, {loader as checkersLoader} from "./pages/chekers/Checkers";
import Erro from "./pages/erro/Erro";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Link, Route } from "react-router-dom";


const routers = createBrowserRouter(createRoutesFromElements(
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} action={HomeAction} />
    <Route path="/nick/:code/:roomtype/:erro?" errorElement={<Erro />} action={nickAction} element={<Nick />} />
    <Route path="/Tic-Tac-Toe/:code/:username" errorElement={<Erro />} element={<TicTacToe />} loader={TicTacToeLoader} />
    <Route path="/Checkers/:code/:username" element={<Checkers />} loader={checkersLoader} />
    <Route path="*" element={<Erro/>} />
  </Route>
));

function App() {
  return (
    <RouterProvider router={routers} />
  );
}

export default App;
