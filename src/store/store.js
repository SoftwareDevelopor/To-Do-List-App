import { configureStore } from "@reduxjs/toolkit";
import userslice  from "../slices/UserSlice";

export const store=configureStore({
    reducer: {
        user:userslice
    }
})