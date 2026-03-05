import { create } from "zustand";
import { TeamMember } from "../../types";

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  removeMember: (uid: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  isLoading: false,

  setMembers: (members) => set({ members }),

  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
    })),

  removeMember: (uid) =>
    set((state) => ({
      members: state.members.filter((m) => m.uid !== uid),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
