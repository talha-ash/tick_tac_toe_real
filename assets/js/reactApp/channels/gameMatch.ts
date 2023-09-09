import { GameLobbyChannel } from ".";
import socket from "../../user_socket";
import useMatchStore, { matchStoreActionsType } from "../stores/matchStore";
import { router } from "../routes";
import { boardBoxNumberType, userReactionType } from "../types";
import { Channel } from "phoenix";
import { gameMatchChannelPushEventsParamsType } from "./types";
import {
  MATCH_END,
  MATCH_STOP_UNEXPECTED,
  PLAYER_GIVE_IN,
  PLAYER_TURN,
  SHOW_REACTION,
} from "../constants";
import useLobbyStore from "../stores/lobbyStore";
class GameMatchChannel {
  channel: Channel | null = null;
  matchId: string = "";
  matchStoreActions: matchStoreActionsType;
  constructor() {
    this.matchStoreActions = useMatchStore.getState().actions;
  }
  joinChannel(matchId: string, name: string) {
    return new Promise((resolve, reject) => {
      this.channel = socket.channel(`gamematch:${matchId}`, { name });
      this.matchId = matchId;
      this.channel
        .join()
        .receive("ok", (resp: any) => {
          this.handleEvents();
          this.matchStoreActions.updateServerState(resp);
          router.navigate({ to: "/match" });
          resolve(resp);
        })
        .receive("error", (resp: any) => {
          console.log("Error", resp);
          reject(resp);
        });
    });
  }

  handlePlayerTurn(key: boardBoxNumberType) {
    this.pushEvent({ eventType: PLAYER_TURN, payload: { key } });
    // this.channel.push(PLAYER_TURN, { key, match_id: this.matchId });
  }

  handlePlayerGiveIn(playerName: string) {
    this.pushEvent({ eventType: PLAYER_GIVE_IN, payload: { playerName } });
    this.onLeave();
  }

  showReaction(reactionType: userReactionType) {
    this.pushEvent({ eventType: SHOW_REACTION, payload: { reactionType } });
  }

  pushEvent({ eventType, payload }: gameMatchChannelPushEventsParamsType) {
    if (!this.channel || !this.matchId) {
      throw new Error("Game Match Channel Or Match Not Exist");
    }
    switch (eventType) {
      case PLAYER_TURN:
        this.channel.push(PLAYER_TURN, {
          key: payload.key,
          match_id: this.matchId,
        });
        break;
      case PLAYER_GIVE_IN:
        this.channel.push(PLAYER_GIVE_IN, {
          player_name: payload.playerName,
          match_id: this.matchId,
        });
        break;
      case SHOW_REACTION:
        this.channel.push(SHOW_REACTION, {
          reaction_type: payload.reactionType,
        });
        break;
      default:
        throw new Error("Invalid Game Match Push Event Type");
    }
  }

  handleEvents() {
    if (!this.channel || !this.matchId) {
      throw new Error(
        "Game Match Channel Or Match ID Not Exist In Handle Event"
      );
    }
    this.channel.on(PLAYER_TURN, (payload: any) => {
      this.matchStoreActions.updateServerState(payload);
    });

    this.channel.on(MATCH_END, (payload: any) => {
      this.matchStoreActions.updateServerState(payload);
      console.log("Match End Double");
      this.clearOnLeave();
    });

    this.channel.on(SHOW_REACTION, (payload: any) => {
      this.matchStoreActions.showReaction({
        reactionType: payload.reaction_type as userReactionType,
      });
    });

    this.channel.on(PLAYER_GIVE_IN, (payload: any) => {
      this.matchStoreActions.resetStore();
      useLobbyStore.getState().actions.reset();
      router.navigate({ to: "/" });
      this.onLeave();
      alert(`Player ${payload.player_name} Give In`);
    });

    this.channel.on(MATCH_STOP_UNEXPECTED, (payload: any) => {
      this.matchStoreActions.resetStore();
      useLobbyStore.getState().actions.reset();
      router.navigate({ to: "/" });
      this.channel = null;
      this.matchId = "";
      alert(`Match Stop Unexpected`);
    });
  }

  clearOnLeave() {
    GameLobbyChannel.leave();
    this.channel = null;
    this.matchId = "";
  }
  onLeave() {
    if (this.channel) {
      this.channel.leave();
      this.clearOnLeave();
    }
  }
}

const instance = new GameMatchChannel();
export default instance;
