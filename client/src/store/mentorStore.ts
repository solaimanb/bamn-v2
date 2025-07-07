import { create } from "zustand";
import { MentorResponse } from "../types/api";

export type Mentor = {
    id: string;
    full_name: string;
    institution: string;
    department: string;
    degrees: string[];
    research_interests: string[];
    continent: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
}

type MentorStore = {
    mentors: MentorResponse[];
    setMentors: (mentors: MentorResponse[]) => void;
};

export const useMentorStore = create<MentorStore>((set) => ({
    mentors: [],
    setMentors: (mentors) => set({ mentors }),
}));