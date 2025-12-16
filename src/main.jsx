
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { registerSW } from 'virtual:pwa-register'

const updateSw=registerSW({
  onNeedRefresh() {
    updateSw(true)
  },
  onOfflineReady() {
    console.log('App is ready to work offline.')
  }
})

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <App />
  </Provider>
  
)


