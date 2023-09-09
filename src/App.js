import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import RecipeUpload from './components/RecipeUpload';
import RecipeDetail from './components/RecipeDetail';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/write" element={<RecipeUpload />} />
          <Route path="/view" element={<RecipeDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
