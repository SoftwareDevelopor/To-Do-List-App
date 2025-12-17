
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

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <App />
  </Provider>
  
)


