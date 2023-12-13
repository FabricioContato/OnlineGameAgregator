import "./App.css";
import Layout from "./pages/layout/Layout";
import Home from "./pages/home/Home";
import TicTacToe, {loader as TicTacToeLoader} from "./pages/tictactoe/Tictactoe";
import Nick from "./pages/nick/Nick";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Link, Route } from "react-router-dom";


const routers = createBrowserRouter(createRoutesFromElements(
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/test" element={<Nick />} />
    <Route path="/test/:code" element={<TicTacToe />} loader={TicTacToeLoader} />
  </Route>
));

function App() {
  return (
    <RouterProvider router={routers} />
  );
}

export default App;
