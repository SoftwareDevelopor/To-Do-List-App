import { createSlice } from "@reduxjs/toolkit";

export const todolistslice=createSlice({
    name:'ToDoList',
    initialState:{
        todolist:localStorage.getItem('todolist')?JSON.parse(localStorage.getItem('todolist')):[]
    },
    reducers:{
        todolistdetails:(state,payload)=>{
            state.todolist=payload.payload.todolist
            localStorage.setItem('todolist',JSON.stringify(payload.payload.todolist))
        },
        cleartodolist:(state)=>{
            state.todolist=[]
            localStorage.removeItem('todolist')
        }
    }
});

export const { todolistdetails, cleartodolist } = todolistslice.actions;
export default todolistslice.reducer