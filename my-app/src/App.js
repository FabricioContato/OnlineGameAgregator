import "./App.css";
import Home from "./pages/home/Home";
import TicTacToe from "./pages/tictactoe/Tictactoe";
import { Link, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test/:code" element={<TicTacToe />} />
    </Routes>
  );
}

export default App;
