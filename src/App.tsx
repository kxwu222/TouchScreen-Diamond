import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import VideoGallery from './components/VideoGallery';
import UniversityTalks from './components/UniversityTalks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/video-gallery" element={<VideoGallery />} />
        <Route path="/university-talks" element={<UniversityTalks />} />
        {/* Catch-all route - redirects any unknown routes to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;