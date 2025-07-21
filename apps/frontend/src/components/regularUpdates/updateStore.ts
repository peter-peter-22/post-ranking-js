import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useUpdateStore = create(combine(
    {
        notifications: 0,
    },
    (set) => ({
        setNotifications:(count:number)=>{
            set((state)=>{
                state.notifications = count
                return {...state}
            })
        }
    })
))