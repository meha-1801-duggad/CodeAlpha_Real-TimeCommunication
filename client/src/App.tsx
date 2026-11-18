import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { HomeView } from './views/HomeView';
import { MeetingRoom } from './views/MeetingRoom';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/meet/:code" element={<MeetingRoom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
