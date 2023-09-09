import React, { useEffect, useMemo, useRef } from "react";
import useLobbyStore from "../stores/lobbyStore";
import { GameMatchChannel } from "../channels";
import { TickBlock } from "../components";
import useMatchStore from "../stores/matchStore";
import { useNavigate } from "@tanstack/react-router";
import { router } from "../routes";
import { LAUGH, HEAD_SHOT } from "../constants";
import MatchReaction from "../components/matchReaction";
import { boardBoxNumberType } from "../types";
export default function Match() {
  const matchStore = useMatchStore((state) => state);
  const resetLobbyStore = useLobbyStore((state) => state.actions.reset);
  const navigate = useNavigate();
  const user = useLobbyStore((state) => state.user)!;
  const isMyTurn = matchStore.turn.name === user.name;
  const turnJamRef = useRef(isMyTurn);
  const onGiveInRef = useRef(true);
  useMemo(() => {
    if (isMyTurn) {
      turnJamRef.current = true;
    }
  }, [matchStore.turn]);

  const onPlayerTurn = (key: boardBoxNumberType, status: null | boolean) => {
    if (isMyTurn && turnJamRef.current && status == null) {
      turnJamRef.current = false;
      GameMatchChannel.handlePlayerTurn(key);
    }
  };

  const onGiveIn = () => {
    matchStore.actions.resetStore();
    resetLobbyStore();
    navigate({ to: "/" });
    GameMatchChannel.handlePlayerGiveIn(user.name);
  };

  useEffect(() => {
    return () => {
      if (router.history.location.pathname != "/match") {
        if (onGiveInRef.current) {
          onGiveIn();
        }
      }
    };
  }, [router.history.location]);

  useEffect(() => {
    if (matchStore.winner || matchStore.filled) {
      onGiveInRef.current = false;
      navigate({ to: "/" });
      setTimeout(() => {
        if (matchStore.winner) {
          matchStore.actions.resetStore();
          resetLobbyStore();
          alert(`${matchStore.winner.name} Win Game`);
        } else {
          alert("Game Draw");
        }
      }, 500);
    }
  }, [matchStore.winner, matchStore.filled]);

  return (
    <div className="h-screen w-screen flex">
      <section className="game-screen flex flex-col w-screen h-screen duration-700 p-6 bg-green-500 items-center">
        <div className="game-screen__title flex flex-col items-center max-w-xs mt-10">
          <h1 className="game-screen__title-text text-5xl text-white block">
            Match {matchStore.player1.name} VS {matchStore.player2.name}
          </h1>
          <h1 className="game-screen__title-text text-3xl text-white block">
            {matchStore.turn.name == user.name
              ? "Your turn"
              : `${matchStore.turn.name}: turn`}
          </h1>
        </div>

        <div className="game-screen__grid flex flex-col h-full justify-center items-center content-center sm:max-w-md max-w-xs">
          <div className="self-center ">
            <div className="text-3xl max-w-md">
              <div className="flex flex-wrap -mb-2 gap-2 justify-center">
                {Object.keys(matchStore.boardStatus).map(
                  (key: boardBoxNumberType) => {
                    let boxStatus = matchStore.boardStatus[key];
                    return (
                      <div
                        key={key}
                        onClick={() => onPlayerTurn(key, boxStatus.status)}
                      >
                        <TickBlock id={key} isCross={boxStatus.status} />
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="game-screen__bottom-panel flex flex-row w-full max-w-xs gap-3 h-24">
          <button
            onClick={onGiveIn}
            className="bg-transparent hover:bg-white text-white font-semibold hover:text-green-500 py-2 px-4 border border-white hover:border-transparent rounded-xl mb-10 w-2/3"
          >
            Give In
          </button>

          <button
            onClick={() => GameMatchChannel.showReaction(LAUGH)}
            className="bg-transparent hover:bg-white text-white font-semibold hover:text-green-500 py-2 px-4 border border-white hover:border-transparent rounded-xl w-1/3 mb-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            onClick={() => GameMatchChannel.showReaction(HEAD_SHOT)}
            className="bg-transparent hover:bg-white text-white font-semibold hover:text-green-500 py-2 px-4 border border-white hover:border-transparent rounded-xl mb-10 w-2/3"
          >
            HeadShot
          </button>

          <MatchReaction />
        </div>
      </section>
    </div>
  );
}
