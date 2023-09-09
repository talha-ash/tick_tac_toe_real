import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { IUser, usersListType } from "../types";

export type lobbyStoreActionsType = {
  updatesUsers: (payload: usersListType) => void;
  setUser: (payload: IUser) => void;
  toggleFindingRival: (payload: boolean | null) => void;
  reset: () => void;
};

export interface ILobbyStore {
  users: usersListType;
  user: IUser | null;
  findingRival: boolean;
  actions: lobbyStoreActionsType;
}

const useLobbyStore = create(
  immer<ILobbyStore>((set) => ({
    users: [],
    user: null,
    findingRival: false,
    actions: {
      updatesUsers: (payload) =>
        set((state) => {
          state.users = payload.filter((user) => user.name != state.user?.name);
        }),

      setUser: (payload) =>
        set((state) => {
          state.user = payload;
        }),
      toggleFindingRival: (findingRival = null) =>
        set((state) => {
          state.findingRival =
            findingRival !== null ? findingRival : !state.findingRival;
        }),
      reset: () =>
        set((state) => {
          state.users = [];
          state.user = null;
          state.findingRival = false;
        }),
    },
  }))
);

export default useLobbyStore;
