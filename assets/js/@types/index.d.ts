import { LiveSocket } from "phoenix_live_view";

declare global {
  // augment the 'externalModule'
  interface Window {
    liveSocket: LiveSocket;
    userToken: string;
  }
}
