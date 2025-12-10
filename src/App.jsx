"use client"
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { toast, ToastContainer } from 'react-toastify'

function App() {
  
  let nowdate=new Date()
  let formattedDate = nowdate.toISOString().slice(0,16)
  const [count, setCount] = useState('')
  let [todoList, setTodoList] = useState([])
  let [datetime, setDatetime] = useState('')
  const [countdowns, setCountdowns] = useState({})


  // Request notification permission quietly on mount (no blocking alerts)
  const remindersSentRef = useRef({})
  const requestNotificationPermission = () => {
    if (!("Notification" in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prevCountdowns => {
        const newCountdowns = { ...prevCountdowns }
        const fiveMin = 5 * 60 * 1000
        todoList.forEach((todo) => {
          const id = todo.id
          const targetTime = new Date(todo.datetime)
          const now = new Date()
          const diff = targetTime - now

          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            newCountdowns[id] = `${days}d ${hours}h ${minutes}m ${seconds}s`

            // Trigger a one-time 5-minute reminder (use a ref to avoid repeated firing)
            if (diff <= fiveMin && !remindersSentRef.current[id]) {
              if (Notification.permission === 'granted') {
                new Notification('Reminder', {
                  body: `Only 5 minutes left for task: "${todo.task}"`,
                  silent: false,
                  
                })
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Reminder', {
                      body: `Only 5 minutes left for task: "${todo.task}"`,
                      silent: false,
                      
                    })
                  }
                })
              }
              playAlarm()
              remindersSentRef.current[id] = true
            }
          } else if (diff <= 0 && newCountdowns[id] && newCountdowns[id] !== "Time's up!") {
            // Alarm triggered
            playAlarm()
            newCountdowns[id] = "Time's up!"
            remindersSentRef.current[id] = true
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

  const saveToDo = (e) => {
    e.preventDefault();
    let obj={
      id: Date.now(),
      task:count,
      datetime:datetime
    }
    if(count==='' || datetime === '') {
        alert('Please select a date and time');
        return;
    }
    if(datetime > formattedDate){  
      setTodoList([...todoList, obj]);
      toast.success('Task added successfully!')
      e.target.reset();
      setCount('');
      setDatetime('');
    }
    else{
      alert('Please select a future date and time');
    }
  }


  let deleteTodo=(id)=>{
    const newTodoList = todoList.filter(t => t.id !== id)
    setTodoList(newTodoList)
    // clear countdown and reminder for this id
    setCountdowns(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    if (remindersSentRef.current[id]) delete remindersSentRef.current[id]
    toast.info('Task deleted successfully!')
  }
  return (
    <>
  <ToastContainer/>
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Todo List :</h1>
        <form onSubmit={saveToDo} className=" mb-2">

          <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a new task..." value={count} onChange={(Event) => setCount(Event.target.value)} />
          <div className='grid grid-cols-[80%_auto] items-center gap-2 py-3'>
            <input type="datetime-local" className='border text-gray-600 h-10 border-gray-300 rounded-md ps-5' name=""  id="" onChange={(e)=>setDatetime(e.target.value)}/>
            <button className='w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700' type="submit" >Add Task</button>
          </div>
        </form>
        <div className="space-y-4">
          {todoList.map((todolist) => {
            return (
              <div key={todolist.id} className="flex items-center relative justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-gray-700">{todolist.task}</span>
                    <button className='py-2 px-4 bg-orange-600 text-white cursor-pointer rounded hover:bg-orange-700' type="button" onClick={()=>deleteTodo(todolist.id)} >Delete</button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{todolist.datetime}</span>
                    <span className="text-md font-semibold text-blue-600">{countdowns[todolist.id] || 'calculating...'}</span>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </>
  )
}

export default App
