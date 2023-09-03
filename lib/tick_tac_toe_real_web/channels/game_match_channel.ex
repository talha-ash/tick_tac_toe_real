defmodule TickTacToeRealWeb.GameMatchChannel do
  use Phoenix.Channel
  alias TickTacToeReal.MatchTableGenServer
  alias TickTacToeReal.MatchGenServer
  alias TickTacToeReal.MatchMakingGenServer

  @impl true
  def join("gamematch:" <> match_id, message, socket) do
    name = Map.get(message, "name")

    case MatchMakingGenServer.on_player_joined(match_id, name) do
      {:ok, match_data} ->
        socket = assign(socket, :match_id, match_id)
        socket = assign(socket, :name, name)
        {:ok, MatchGenServer.generate_match_state(match_data.match), socket}

      {:error, message} ->
        {:error, message}
    end
  end

  @impl true
  def handle_in("player_turn", %{"key" => key, "match_id" => match_id}, socket) do
    {_, game_server_pid} = MatchTableGenServer.get_match_pid(match_id)
    game_state = MatchGenServer.on_player_turn(game_server_pid, key)
    IO.inspect(MatchMakingGenServer.access_state(), label: "Match Making State Player Turn")

    case game_state.winner != nil || game_state.filled != nil do
      true ->
        clear_on_match_end(game_server_pid, match_id)
        broadcast!(socket, "match_end", game_state)
        {:stop, :normal, socket}

      _ ->
        broadcast!(socket, "player_turn", game_state)
        {:reply, {:ok, %{}}, socket}
    end
  end

  @impl true
  def handle_in("show_reaction", %{"reaction_type" => reaction_type}, socket) do
    broadcast!(socket, "show_reaction", %{reaction_type: reaction_type})
    {:reply, {:ok, %{}}, socket}
  end

  @impl true
  def handle_in("player_give_in", %{"player_name" => player_name, "match_id" => match_id}, socket) do
    {_, game_server_pid} = MatchTableGenServer.get_match_pid(match_id)

    clear_on_match_end(game_server_pid, match_id)
    broadcast!(socket, "player_give_in", %{player_name: player_name})
    {:stop, :normal, socket}
  end

  @impl true
  def terminate(reason, socket) do
    with true <- unexpected_terminate(socket, reason),
         {:ok, game_server_pid} <- MatchTableGenServer.get_match_pid(socket.assigns.match_id) do
      IO.inspect(socket.assigns.name, label: "My Name")
      IO.inspect(reason, label: "#{socket.assigns.name}Mine reason")
      clear_on_match_end(game_server_pid, socket.assigns.match_id)
      broadcast!(socket, "match_stop_unexpected", %{})
    end
  end

  defp unexpected_terminate(socket, reason) do
    Map.has_key?(socket.assigns, :name) && Map.has_key?(socket.assigns, :match_id) &&
      {:shutdown, :closed} == reason
  end

  defp clear_on_match_end(game_server_pid, match_id) do
    MatchGenServer.stop_match_server(game_server_pid)
    MatchMakingGenServer.on_match_end(match_id)
  end
end
