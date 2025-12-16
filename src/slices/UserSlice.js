import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookies";




export const userslice=createSlice({
    name:'User',
    initialState:{
        user:Cookies.getItem('user')?JSON.parse(Cookies.getItem('user')):null,
        token:Cookies.getItem('token')?Cookies.getItem('token'):null
    },
    reducers:{
        userdetails:(state,payload)=>{
            state.user=payload.payload.user
            state.token=payload.payload.token
            Cookies.setItem('user',JSON.stringify(payload.payload.user))
            Cookies.setItem('token',payload.payload.token)
        },
        logout:(state)=>{
            state.user=null
            state.token=null
            Cookies.removeItem('user')
            Cookies.removeItem('token')
        }
    }
});

export const { userdetails, logout } = userslice.actions;
export default userslice.reducer