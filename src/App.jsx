"use client"
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState('')
  let [todoList, setTodoList] = useState([])
  const saveToDo = () => {
    if (count === '') {
      alert('Please enter a task')
    } else {
      setTodoList([...todoList, count])
      setCount('')
    }
  }

  let deleteTodo=(i)=>{
    let newTodoList=[...todoList]
    newTodoList.splice(i, 1)
    setTodoList(newTodoList)

  }
  return (
    <>

      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Static Todo List</h1>
        <div className="grid grid-cols-[80%_auto] items-center gap-1 mb-2">

          <input type="text" className="w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a new task..." value={count} onChange={(Event) => setCount(Event.target.value)} />
          <button className='w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700' type="button" onClick={saveToDo}>Add Task</button>
        </div>
        <div className="space-y-4">
          {todoList.map((todolist, index) => {
            return (
              <div key={index} className="flex items-center relative justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center ">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded mr-4" />
                  <span className="text-lg text-gray-700">{todolist}</span>
                  <button className='absolute right-[15px] py-2 px-4 bg-orange-600 cursor-pointer' type="button" onClick={()=>deleteTodo(index)} >Delete</button>
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
