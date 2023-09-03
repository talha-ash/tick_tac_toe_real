import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { IUser, boardStatusType, userReactionType } from "../types";

interface IInitialStateType {
  boardStatus: boardStatusType;
  turn: IUser;
  player1: IUser;
  player2: IUser;
  winner: IUser | null;
  filled: boolean;
  reactionType: userReactionType;
}
const initialState: IInitialStateType = {
  boardStatus: {} as boardStatusType,
  turn: {} as IUser,
  player1: {} as IUser,
  player2: {} as IUser,
  winner: null,
  filled: false,
  reactionType: "",
};

export type matchStoreActionsType = {
  resetStore: () => void;
  updateServerState: (payload: any) => void;
  showReaction: (payload: { reactionType: userReactionType }) => void;
};
export interface ILobbyStore extends IInitialStateType {
  actions: matchStoreActionsType;
}

const useMatchStore = create(
  immer<ILobbyStore>((set) => ({
    ...initialState,
    actions: {
      resetStore: () =>
        set((state) => {
          return initialState;
        }),
      updateServerState: (payload) =>
        set((state) => {
          state.boardStatus = payload.board_status;
          state.turn = payload.turn;
          state.player1 = payload.player_1;
          state.player2 = payload.player_2;
          state.winner = payload.winner;
          state.filled = payload.filled;
        }),
      showReaction: ({ reactionType }) =>
        set((state) => {
          state.reactionType = reactionType;
        }),
    },
  }))
);

export default useMatchStore;
