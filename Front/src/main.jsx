import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Route, Routes } from 'react-router'

import { AppProvider } from './context/AppContext.jsx'

import { Provider } from 'react-redux'
import store from './redux/store.js'

import Chord from './views/Chord.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <Provider store={store}>
        <Routes>

          <Route path='/' element={<Chord />} />

        </Routes>
      </Provider>
    </AppProvider>
  </BrowserRouter>
)

