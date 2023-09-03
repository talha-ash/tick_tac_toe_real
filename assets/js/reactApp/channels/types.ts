import {
  PLAYER_GIVE_IN,
  PLAYER_TURN,
  PLAY_GAME,
  SHOW_REACTION,
} from "../constants";
import { boardBoxNumberType, userReactionType } from "../types";

export type gameMatchChannelPushEventsParamsType =
  | {
      eventType: typeof PLAYER_TURN;
      payload: { key: boardBoxNumberType };
    }
  | {
      eventType: typeof PLAYER_GIVE_IN;
      payload: { playerName: string };
    }
  | {
      eventType: typeof SHOW_REACTION;
      payload: { reactionType: userReactionType };
    };

export type gameMatchChannelPushEventsType =
  | typeof PLAYER_TURN
  | typeof PLAYER_GIVE_IN
  | typeof SHOW_REACTION;

export type gameLobbyChannelPushEventsParamsType = {
  eventType: typeof PLAY_GAME;
  payload: { name: string };
};

export type gameLobbyChannelPushEventsType = typeof PLAY_GAME;
