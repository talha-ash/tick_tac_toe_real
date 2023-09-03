import { HEAD_SHOT, LAUGH } from "./constants";

export interface IUser {
  name: string;
  online: string;
}

export type usersListType = Array<IUser>;

export type userReactionType = typeof LAUGH | typeof HEAD_SHOT | "";

export type boardBoxNumberType =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8";
export type boardStatusType = {
  [key in boardBoxNumberType]: {
    player: string;
    status: boolean | null;
  };
};
