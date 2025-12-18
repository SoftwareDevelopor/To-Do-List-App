import { configureStore } from "@reduxjs/toolkit";
import userslice from "../slices/UserSlice";
import todolistslice from "../slices/ToDoListSlice";

export const store = configureStore({
    reducer: {
        user: userslice,
        todolistdetailing: todolistslice
    }
})