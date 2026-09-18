import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuestionBank from './pages/QuestionBank';
import Practice from './pages/Practice';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Flashcards from './pages/Flashcards';
import WrongReview from './pages/WrongReview';
import { getStoredTheme, setStoredTheme, getLastSubject, setLastSubject } from './utils/storage';

export default function App() {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [currentSubject, setCurrentSubject] = useState(() => getLastSubject());

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSubjectChange = (newSub) => {
    setCurrentSubject(newSub);
    setLastSubject(newSub);
  };

  return (
    <div className="app-container">
      <Header
        currentSubject={currentSubject}
        onSubjectChange={handleSubjectChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                currentSubject={currentSubject} 
                onSelectSubject={handleSubjectChange} 
              />
            } 
          />
          <Route 
            path="/bank" 
            element={
              <QuestionBank 
                currentSubject={currentSubject} 
                onSelectSubject={handleSubjectChange} 
              />
            } 
          />
          <Route 
            path="/practice" 
            element={
              <Practice 
                currentSubject={currentSubject} 
              />
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <Quiz 
                currentSubject={currentSubject} 
              />
            } 
          />
          <Route 
            path="/result" 
            element={<Result />} 
          />
          <Route 
            path="/flashcards" 
            element={
              <Flashcards 
                currentSubject={currentSubject} 
              />
            } 
          />
          <Route 
            path="/wrong-review" 
            element={
              <WrongReview 
                currentSubject={currentSubject} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
