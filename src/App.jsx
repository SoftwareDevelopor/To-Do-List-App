"use client"
import { useState, useEffect } from 'react'
import './App.css'
import { toast, ToastContainer } from 'react-toastify'
import logo from '/maskable_icon_x48.png'
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc'
// NOTE: firebaseConfig file available honi chahiye
import app from './firebaseConfig'
import { useDispatch, useSelector } from 'react-redux'
import { userdetails } from './slices/UserSlice'
import { BiPlus } from 'react-icons/bi'

function App() {

  const nowdate = new Date()
  const formattedDate = nowdate.toISOString().slice(0, 16)

  const [count, setCount] = useState('')
  // 🔑 LOCAL STORAGE: Initial state ko Local Storage se load karna
  const [todoList, setTodoList] = useState(() => {
    try {
      const storedTodos = localStorage.getItem('todoList');
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error("Error loading todos from local storage:", error);
      return [];
    }
  })

  const [priority, setPriority] = useState('')
  const [datetime, setDatetime] = useState('')
  const [countdowns, setCountdowns] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [open, setopen] = useState(false)

  // 🆕 AUTH LOADING STATE
  const [authLoading, setAuthLoading] = useState(true);

  const dispatch = useDispatch()


  // ==========================================================
  // 🔄 PERSISTENCE & LIFECYCLE HOOKS
  // ==========================================================

  // 1. LOCAL STORAGE: TodoList mein change hone par data save karna
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }, [todoList]);

  // 2. FIREBASE AUTH PERSISTENCE: Login status aur Loading State maintain karna
  useEffect(() => {
    const auth = getAuth(app);

    // Auth check shuru ho raha hai
    setAuthLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User signed in
        currentUser.getIdToken().then(token => {
          dispatch(userdetails({ user: currentUser, token: token }));
        });
      } else {
        // User signed out
        dispatch(userdetails({ user: null, token: null }));
      }

      // Auth check poora ho gaya
      setAuthLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [dispatch]);

  // 3. NOTIFICATION PERMISSION: Permission request karna
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }, []);


  const userdata = useSelector((state) => {
    console.log(state)
    return state.user.user
  })

  const usertoken = useSelector((state) => state.user.token)

  // ==========================================================
  // 🔔 NOTIFICATION & COUNTDOWN LOGIC
  // ==========================================================

  // Notification handler
  const handlesend = async (Task, DateTime) => {
    // Service Worker ke through notification bhejne ki koshish (background/closed app ke liye)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && typeof registration.showNotification === 'function') {
          const title = 'Reminder';
          const options = {
            body: `Please complete the Task ${Task} which is due at ${DateTime}`,
            icon: logo,
          };
          registration.showNotification(title, options);
          return;
        }
      } catch (error) {
        console.error('Error in service worker notification:', error);
      }
    }

    // Fallback: Agar SW fail ho ya support na ho, toh direct Notification API/Toast
    if (Notification.permission === 'granted') {
      new Notification('Reminder', {
        body: `Please complete the Task ${Task} which is due at ${DateTime}`,
        icon: logo,
      });
    } else {
      toast.info(`REMINDER: Task ${Task} due at ${DateTime}`);
    }
  }


  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prevCountdowns => {
        const newCountdowns = { ...prevCountdowns }
        const fiveMinutes = 5 * 60 * 1000

        todoList.forEach((todo, index) => {
          const targetTime = new Date(todo.datetime)
          const now = new Date()
          const diff = targetTime - now

          if (diff > 0) {
            // Notification trigger: 5 minutes se kam time bacha ho
            if (diff <= fiveMinutes && diff > fiveMinutes - 1000) {
              playAlarm()
              handlesend(todo.task, todo.datetime)
            }
            // Countdown calculation
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            newCountdowns[index] = `${days}d ${hours}h ${minutes}m ${seconds}s`
          } else if (diff <= 0 && newCountdowns[index] && newCountdowns[index] !== "Time's up!") {
            playAlarm()
            newCountdowns[index] = "Time's up!"
          }
        })
        return newCountdowns
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [todoList])

  // Play alarm sound
  const playAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1)
  }

  // ==========================================================
  // 📝 HANDLERS
  // ==========================================================

  const saveToDo = (e) => {
    e.preventDefault();
    let obj = {
      task: count,
      datetime: datetime,
      priority: priority
    }
    if (count === '' || datetime === '') {
      alert('Please enter task and select date/time');
      return;
    }
    // Future date check
    if (new Date(datetime) > new Date(formattedDate)) {
      setTodoList([...todoList, obj]);
      toast.success('Task added successfully!')
      e.target.reset();
      setCount('');
      setDatetime('');
      setPriority('');
      setOpenModal(false);
    }
    else {
      alert('Please select a future date and time');
    }
  }

  // ⏫ UPDATED GOOGLE SIGN-IN HANDLER
  let handleUserSubmit = () => {
    const provider = new GoogleAuthProvider()
    const auth = getAuth(app)

    signInWithPopup(auth, provider)
      .then(() => {
        // Redux update will happen via onAuthStateChanged
        toast.success(`Welcome! You are now signed in.`)
      })
      .catch((error) => {
        console.error("Google Sign-in failed:", error)

      })
  }



  let deleteTodo = (id) => {
    const updatedList = todoList.filter((todo, index) => index !== id)
    setTodoList(updatedList)
    toast.info('Task deleted successfully!')
  }

  const logout=()=>{
    setopen(false)
    dispatch(userdetails({user:null,token:null}))
  }

  return (
    <>
      <ToastContainer />

      {/* 🖼️ AUTH LOADING SCREEN */}

      <header className='max-w-full bg-pink-300 '>
        <nav class=" w-full px-2 py-4 lg:px-4.5 ">
          <div class="max-w-screen flex items-center justify-between mx-auto">
            <a href={'/'} class="flex items-center space-x-1 rtl:space-x-reverse">
              <img src={logo} class="h-7" alt="Logo" />
              <span class="self-center text-xl text-heading font-semibold whitespace-nowrap">To-Do App</span>
            </a>
            <ul class="flex gap-2 items-center md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li className="cursor-pointer" onClick={() => setOpenModal(true)}>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-xl font-extrabold"><BiPlus className='text-white' /></div>
              </li>
              {
                !userdata || !usertoken
                  ?
                  <li onClick={handleUserSubmit} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer px-2 py-1 bg-red-600 rounded-4xl text-white">
                    <p>Sign in with </p>
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-100">
                      <FcGoogle className='text-2xl font-bold' />
                    </div>
                  </li>
                  :
                  <li>
                    <h1 className='text-xl font-bold relative cursor-pointer' onClick={() => setopen(true)}>{userdata?.displayName || 'User'}
                      <div className={`absolute top-[45px] right-0 bg-white shadow-lg border px-3 py-2 rounded-md z-10 ${open == true ? 'block' : 'hidden'}`}  onClick={logout}>
                        <h2 className="text-lg font-semibold" >Logout</h2>
                      </div>
                    </h1>
                  </li>
              }
            </ul>
          </div>
        </nav>
      </header>
      {authLoading ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
          <p className="text-2xl font-bold text-blue-600 animate-pulse">Loading User Session...</p>
          <p className="text-sm text-gray-500 mt-2">Checking saved login details.</p>
        </div>
      ) : (
        // ------------------------------------------------
        // 🚀 MAIN APPLICATION UI
        // ------------------------------------------------
        <>

          {/* Modal Overlay and Content */}
          <div className={`fixed bg-gray-50 w-[100%] h-[100vh] ${openModal == true ? ' block' : 'hidden'}`}></div>
          <div className={` mb-2 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 z-50 max-w-[550px] w-full rounded-lg shadow-lg ${openModal == true ? 'scale-100' : 'scale-0'} duration-300 bg-white`}>
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <span className='text-3xl font-bold absolute right-5 top-1 cursor-pointer' onClick={() => setOpenModal(false)}>&times;</span>
            <form onSubmit={saveToDo}>

              <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a new task..." value={count} onChange={(Event) => setCount(Event.target.value)} />
              <input type="number" name="" className="w-full h-10 px-4 py-3 my-[20px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add task priority..." id="" value={priority} onChange={(e) => setPriority(e.target.value)} />
              <div className='grid grid-cols-[75%_auto] items-center gap-2 py-3'>
                <input type="datetime-local" className='border text-gray-600 h-10 border-gray-300 rounded-md ps-5' name="" id="" onChange={(e) => setDatetime(e.target.value)} />
                <button className='w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700' type="submit" >Add Task</button>
              </div>
            </form>
          </div>

          {/* Todo List Table */}
          <div className="bg-red-300 p-6 rounded-lg shadow-2xl w-full max-w-[1320px] mt-[50px] mx-auto ">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Todo List :</h1>

            <div class="overflow-x-auto bg-neutral-primary-soft shadow-xs border border-default rounded-lg scrollbar-hide">
              <table class="w-full text-sm text-left rtl:text-right text-body ">
                <thead class="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default text-center">
                  <tr>
                    <th class="px-6 py-3 font-medium">Task</th>
                    <th class="px-6 py-3 font-medium">Date-Time</th>
                    <th class="px-6 py-3 font-medium">Countdown</th>
                    <th class="px-6 py-3 font-medium">Priority</th>
                    <th class="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody class="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default text-center">
                  {
                    todoList.length >= 1 ?
                      todoList.map((todolist, index) => {
                        return (
                          <tr key={index} class="bg-neutral-primary border-b border-default">
                            <th class="px-6 py-4 font-medium text-heading whitespace-nowrap">{todolist.task}</th>
                            <td class="px-6 py-4">{todolist.datetime}</td>
                            <td class="px-6 py-4">{countdowns[index] || 'Time Up'}</td>
                            <td class="px-6 py-4">{todolist.priority}</td>
                            <td class="px-6 py-4">
                              <button className='py-2 px-4 bg-orange-600 text-white cursor-pointer rounded hover:bg-orange-700' type="button" onClick={() => deleteTodo(index)} >Delete</button>
                            </td>
                          </tr>
                        )
                      })
                      :
                      <tr class="bg-neutral-primary border-b border-default">
                        <td colspan="5" class="px-6 py-4 text-center">
                          No tasks available. Please add a task.
                        </td>
                      </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default App