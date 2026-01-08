import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import './App.scss'
import Chat from "./pages/Chat.jsx";
import InfiniteScroll from "./pages/InfiniteScroll.jsx";

function App() {

  return (
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Chat />} />
                  <Route path="/infinite-scroll" element={<InfiniteScroll />} />
              </Routes>
      </BrowserRouter>
  )
}

export default App
