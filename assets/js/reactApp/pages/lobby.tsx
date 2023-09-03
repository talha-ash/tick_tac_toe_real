import React from "react";
import useLobbyStore from "../stores/lobbyStore";
import { GameLobbyChannel } from "../channels";
import { ActivityIndicator } from "../components";
export default function Lobby() {
  const { users, findingRival, user } = useLobbyStore((state) => state);

  const playGame = () => {
    if (!findingRival && user) {
      GameLobbyChannel.playGame(user.name);
    }
  };
  return (
    <div>
      Lobby
      <div>
        <button
          type="button"
          onClick={playGame}
          className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 "
        >
          Play Game
        </button>
        {findingRival ? <ActivityIndicator /> : null}
      </div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => {
          return (
            <li key={user.name}>
              {user.name}:{new Date(Number(user.online)).toTimeString()}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
