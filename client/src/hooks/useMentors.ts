import api from "@/lib/api";
import { useMentorStore } from "@/store/mentorStore";
import { useEffect } from "react";

export function useMentors(){
    const {mentors, setMentors} = useMentorStore()
    console.log("MENTORS AT - useMentors:", mentors)

    useEffect(()=>{
        api.get('/mentors')
        .then(res=> setMentors(res.data))
        .catch(err => console.error(err))
    }, [setMentors])
}