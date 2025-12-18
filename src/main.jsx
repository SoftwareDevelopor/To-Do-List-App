import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'


async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    }
    catch (err) {
      console.log('Service Worker registration failed: ', err);
    }
  }
}

registerServiceWorker()

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <App />
  </Provider>

)


