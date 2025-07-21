import { QueryKey } from '@tanstack/react-query';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const usePostFeedStore = create(combine(
    {
        queryKey:undefined as QueryKey |undefined,
        postId:undefined as string | undefined
    },
    (set) => ({
        selectFeed:(queryKey?:QueryKey,postId?:string)=>{
            set(()=>{
                return {queryKey:queryKey,postId:postId}
            })
        }
    })
))