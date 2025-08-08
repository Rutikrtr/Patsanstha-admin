import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './store';
import Login from './components/auth/Login';
import Patsanstha from './components/dashboard/Patsanstha';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/Patsanstha" 
                element={
                  <ProtectedRoute>
                    <Patsanstha />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/Patsanstha" replace />} />
              <Route path="*" element={<Navigate to="/Patsanstha" replace />} />
            </Routes>
          </Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;