import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './Redux/store.js'
import {Provider} from 'react-redux'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <AuthProvider>
        <StrictMode>
          <App />
          <Toaster
            position="bottom-right"
            reverseOrder={false}
          />
        </StrictMode>
      </AuthProvider>
    </ThemeProvider>
  </Provider>
)
