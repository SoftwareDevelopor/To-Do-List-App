
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default small bar
  e.preventDefault();
  e.prompt(); 
  e.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install');
    }
    window.deferredPrompt = null;
  });
});

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <App />
  </Provider>
  
)


