import { useEffect, type ReactNode } from "react";
import { selectIsResolving, useAuthStore, } from "@/features/auth/stores/authStore";

export const AuthGate = ({children}:{children:ReactNode})=>{

    const initalize = useAuthStore((state)=>state.initialize);
    const isResolving = useAuthStore(selectIsResolving);

    useEffect(()=>{
        initalize()
    },[initalize])


    if(isResolving){
        return <div className="app-loading">Loading...</div>
    }

    return <>{children}</>

}