import React, { useState } from "react";
import { GameLobbyChannel } from "../channels";
import { useNavigate } from "@tanstack/react-router";
import useLobbyStore from "../stores/lobbyStore";
export default function Home() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const setUser = useLobbyStore((state) => state.actions.setUser);
  const joinGameZoneLobby = () => {
    GameLobbyChannel.joinChannel(name)
      .then((resp: any) => {
        console.log(resp);
        setUser({ name: resp.name, online: resp.online_at });
        navigate({ to: "/lobby" });
      })
      .catch((error) => {
        alert(error.reason);
      });
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div>
        <label
          htmlFor="name"
          className="block mb-2 text-sm font-medium text-gray-900 "
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
          placeholder="John"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="mt-3">
          <button
            type="button"
            onClick={joinGameZoneLobby}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 "
          >
            Join Game Zone
          </button>
        </div>
      </div>
    </div>
  );
}
