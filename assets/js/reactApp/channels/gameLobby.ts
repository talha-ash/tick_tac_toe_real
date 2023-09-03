import socket from "../../user_socket";
import { Channel, Presence } from "phoenix";
import useLobbyStore, {
  ILobbyStore,
  lobbyStoreActionsType,
} from "../stores/lobbyStore";
import { GameMatchChannel } from ".";
import { usersListType } from "../types";
import { MATCH_END, MATCH_FOUND, PLAY_GAME } from "../constants";
import { gameLobbyChannelPushEventsParamsType } from "./types";

class GameLobbyChannel {
  channel: Channel | null = null;
  presence: Presence | null = null;
  lobbyStoreActions: lobbyStoreActionsType;
  constructor() {
    this.lobbyStoreActions = useLobbyStore.getState().actions;
  }
  joinChannel(name: string) {
    return new Promise((resolve, reject) => {
      this.channel = socket.channel("gamezone:lobby", { name });
      this.channel
        .join()
        .receive("ok", (resp) => {
          this.presence = new Presence(this.channel!);
          this.presence.onSync(() => this.updateLobbyUserList());
          this.handleEvents();
          resolve(resp);
        })
        .receive("error", (resp: any) => {
          reject(resp);
        });
    });
  }

  updateLobbyUserList() {
    if (this.presence) {
      let users: usersListType = [];
      this.presence.list((id: string, { metas: [first] }: any) => {
        users.push({ name: id, online: first.online_at });
      });

      this.lobbyStoreActions.updatesUsers(users);
    }
  }

  playGame(name: string) {
    this.pushEvent({ eventType: PLAY_GAME, payload: { name } });
    this.lobbyStoreActions.toggleFindingRival(true);
  }

  pushEvent({ eventType, payload }: gameLobbyChannelPushEventsParamsType) {
    if (!this.channel) {
      throw new Error("Game Match Channel Or Match Not Exist");
    }
    switch (eventType) {
      case PLAY_GAME:
        this.channel.push(PLAY_GAME, { name: payload.name });
        break;

      default:
        throw new Error("Invalid Game Lobby Channel Push Event Type");
    }
  }

  handleEvents() {
    if (!this.channel) {
      throw new Error(
        "Game Lobby Channel Or Match Id Not Exist In Handle Event"
      );
    }
    this.channel.on(MATCH_FOUND, (payload) => {
      let user = useLobbyStore.getState().user!;
      if (payload.players.includes(user.name)) {
        GameMatchChannel.joinChannel(payload.match_id, user.name);
        this.lobbyStoreActions.toggleFindingRival(false);
      }
    });
  }
  leave() {
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
      this.presence = null;
    }
  }
}
const instance = new GameLobbyChannel();
export default instance;
