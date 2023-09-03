import React, { useEffect } from "react";
import useMatchStore from "../stores/matchStore";
import { HEAD_SHOT, LAUGH } from "../constants";

const MatchReaction = React.memo(() => {
  const reactionType = useMatchStore((state) => state.reactionType);

  useEffect(() => {
    switch (reactionType) {
      case LAUGH:
        console.log("Play");
        new Audio("./audios/smile.mp3").play();
        break;
      case HEAD_SHOT:
        new Audio("./audios/headShot.mp3").play();
        break;
      default:
        return;
    }
  });
  return null;
});

export default MatchReaction;
