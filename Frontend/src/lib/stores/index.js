import {writable} from 'svelte/store';
import { browser } from '$app/environment';

function createUserStore(){
    const{subscribe,set,update} = writable(null);

    return{
        subscribe,
        set:(user)=>{
            set(user);
            if(browser){
                if(user){
                    localStorage.setItem('user',JSON.stringify(user))
                }else {
                    localStorage.removeItem('user')
                }
            }
        },
        init:()=>{
            if(browser){
                const storedUser = localStorage.getItem('user')
                if(storedUser){
                    try{
                        set(JSON.parse(storedUser))
                    }
                    catch(err){
                        localStorage.removeItem('user')
                    }
                }
            }
        },
        logout:()=>{
            set(null);
            if(browser){
                localStorage.removeItem('user')
                localStorage.removeItem('token')
            }
        }
    }
}

export const userStore = createUserStore();