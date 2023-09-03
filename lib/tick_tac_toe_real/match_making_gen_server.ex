defmodule TickTacToeReal.MatchMakingGenServer do
  use GenServer
  alias TickTacToeReal.MatchGenServer
  alias TickTacToeReal.MatchTableGenServer

  # Client

  def start_link(default) when is_list(default) do
    GenServer.start_link(__MODULE__, default, name: __MODULE__)
  end

  def add_player(name) do
    GenServer.cast(__MODULE__, {:add_player, name})
  end

  def remove_player(name) do
    GenServer.cast(__MODULE__, {:remove_player, name})
  end

  def get_match(match_id) do
    GenServer.cast(__MODULE__, {:on_match_end, match_id})
  end

  def on_match_end(match_id) do
    GenServer.cast(__MODULE__, {:on_match_end, match_id})
  end

  def on_player_joined(match_id, player) do
    GenServer.call(__MODULE__, {:on_player_joined, {match_id, player}})
  end

  def access_state() do
    GenServer.call(__MODULE__, :access_state)
  end

  # Server (callbacks)

  @impl true
  def init(_) do
    {:ok, %{players: [], matches: []}}
  end

  @impl true
  def handle_info(:match_make, state) do
    waiting_players = Enum.filter(state.players, fn player -> player.status == false end)

    state =
      cond do
        length(waiting_players) > 1 ->
          players =
            waiting_players
            |> Enum.take(2)
            |> Enum.map(fn player -> Map.put(player, :status, true) end)

          match = %{match_id: Ecto.UUID.generate(), players: players}

          matches = state.matches ++ [match]

          Phoenix.PubSub.broadcast(
            TickTacToeReal.PubSub,
            "gamezone:lobby",
            {:match_found, match}
          )

          state
          |> Map.put(:matches, matches)
          |> update_match_players_status(match.players)

        true ->
          IO.inspect("Its NotGreater")
          state
      end

    {:noreply, state}
  end

  @impl true
  def handle_cast({:add_player, name}, state) do
    players = state.players ++ [%{name: name, status: false, joined: false}]
    state = Map.put(state, :players, players)

    case player_already_added(state.players, name) do
      true ->
        send(self(), :match_make)
        {:noreply, state}

      _ ->
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({:on_match_end, match_id}, state) do
    match = Enum.find(state.matches, nil, fn match -> match.match_id == match_id end)

    case match do
      nil ->
        {:noreply, state}

      _ ->
        matches = Enum.filter(state.matches, fn match -> match.match_id != match_id end)
        player_one_name = Enum.at(match.players, 0).name
        player_two_name = Enum.at(match.players, 1).name

        players =
          Enum.filter(state.players, fn player ->
            player.name == player_one_name || player.name == player_two_name
          end)

        state = state |> Map.put(:matches, matches) |> Map.put(:players, players)
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({:remove_player, name}, state) do
    players = Enum.filter(state.players, fn player -> player.name != name end)
    state = Map.put(state, :players, players)
    {:noreply, state}
  end

  @impl true
  def handle_call({:get_match, match_id}, _, state) do
    match = Enum.find(state.matches, nil, fn match -> match.match_id == match_id end)
    {:reply, match, state}
  end

  @impl true
  def handle_call(:access_state, _, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:on_player_joined, {match_id, player}}, _, state) do
    match_index = Enum.find_index(state.matches, fn match -> match.match_id == match_id end)

    with true <- match_index != nil,
         true <- is_valid_player(Enum.at(state.matches, match_index).players, player) do
      match = Enum.at(state.matches, match_index)
      players = update_player_joined(match.players, player)
      is_both_joined = Enum.all?(players, fn player -> player.joined end)
      start_match_server(is_both_joined, match)
      matches = update_match(state.matches, match_id, :players, players)
      state = Map.put(state, :matches, matches)
      {:reply, {:ok, %{both_joined: is_both_joined, match: match}}, state}
    else
      _ ->
        {:reply, {:error, %{reason: "Match or player is invalid"}}, state}
    end
  end

  defp start_match_server(both_joined, match) when both_joined == true do
    {:ok, pid} = MatchGenServer.start_link(match)
    MatchTableGenServer.insert(match.match_id, pid)
  end

  defp start_match_server(_both_joined, _match) do
  end

  defp update_match(matches, match_id, key, value) do
    Enum.map(matches, fn match ->
      case match.match_id == match_id do
        true ->
          Map.put(match, key, value)

        false ->
          match
      end
    end)
  end

  defp update_player_joined(players, joining_player) do
    Enum.map(players, fn player ->
      case player.name == joining_player do
        true ->
          Map.put(player, :joined, true)

        false ->
          player
      end
    end)
  end

  defp update_match_players_status(state, match_players) do
    players =
      Enum.map(state.players, fn player ->
        case Enum.any?(match_players, fn match_player -> match_player.name == player.name end) do
          true ->
            Map.put(player, :status, true)

          _ ->
            player
        end
      end)

    Map.put(state, :players, players)
  end

  defp player_already_added(players, new_player) do
    Enum.any?(players, fn player -> player.name == new_player end)
  end

  defp is_valid_player(players, name) do
    Enum.any?(players, fn player -> player.name == name end)
  end
end
