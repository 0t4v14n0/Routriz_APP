import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 👇 Adicione esta importação
import { registerSW } from 'virtual:pwa-register'; 

// 👇 E chame a função para registrar o aplicativo no celular
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
