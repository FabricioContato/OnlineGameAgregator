import "./App.css";
import Home from "./pages/home/Home";
import TicTacToe from "./pages/tictactoe/Tictactoe";
import { Routes } from "react-router-dom";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Link, Route } from "react-router-dom";


const routers = createBrowserRouter(createRoutesFromElements(
  <>
  <Route path="/" element={<Home />} />
  <Route path="/test/:code" element={<TicTacToe />} />
  </>
));

function App() {
  return (
    <RouterProvider router={routers} />
  );
}

export default App;
