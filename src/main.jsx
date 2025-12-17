
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { registerSW } from 'virtual:pwa-register'


registerSW({
  onNeedRefresh(){
    if(confirm("New version available. Do you want to update?")){
      window.location.reload();
    }
  },
  onOfflineReady() {}
})

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default small bar
  e.preventDefault();
  
  // Immediately show the large native install prompt
  // Note: This usually requires a user click elsewhere on the page first 
  // due to browser security policies.
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


