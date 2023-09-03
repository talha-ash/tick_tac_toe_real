defmodule TickTacToeReal.MatchGenServer do
  use GenServer

  # Client
  @winning_index_configurations [
    #  horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    #  vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    #  diagonal
    [0, 4, 8],
    [2, 4, 6]
  ]

  def start_link(match) do
    GenServer.start_link(__MODULE__, match)
  end

  def on_player_turn(game_server_pid, key) do
    GenServer.call(game_server_pid, {:player_turn, key})
  end

  def stop_match_server(game_server_pid) do
    GenServer.cast(game_server_pid, {:stop})
  end

  def generate_match_state(match) do
    players = match.players
    player_1 = Enum.at(players, 0)
    player_2 = Enum.at(players, 1)

    %{
      winner: nil,
      filled: nil,
      turn: player_1,
      player_1: player_1,
      player_2: player_2,
      board_status: %{
        "0": %{player: nil, status: nil},
        "1": %{player: nil, status: nil},
        "2": %{player: nil, status: nil},
        "3": %{player: nil, status: nil},
        "4": %{player: nil, status: nil},
        "5": %{player: nil, status: nil},
        "6": %{player: nil, status: nil},
        "7": %{player: nil, status: nil},
        "8": %{player: nil, status: nil}
      }
    }
  end

  # Server (callbacks)

  @impl true
  def init(match) do
    {:ok, generate_match_state(match)}
  end

  @impl true
  def handle_cast({:stop}, state) do
    {:stop, :normal, state}
  end

  # @Todo Make is Cast call
  @impl true
  def handle_call({:player_turn, key}, _, state) do
    turn = state.turn
    state = update_state(key, state)

    state =
      cond do
        is_player_win(turn.name, state.board_status) ->
          Map.put(state, :winner, turn)

        is_all_fill(state.board_status) ->
          Map.put(state, :filled, true)

        true ->
          state
      end

    {:reply, state, state}
  end

  defp update_state(key, state) do
    %{turn: turn, board_status: board_status, player_1: player_1, player_2: player_2} = state

    status = turn.name == player_1.name
    board_value = %{player: turn.name, status: status}
    board_status = Map.put(board_status, String.to_existing_atom(key), board_value)
    turn = next_turn(turn, player_1, player_2)

    state =
      state
      |> Map.put(:turn, turn)
      |> Map.put(:board_status, board_status)

    state
  end

  defp next_turn(turn, player_1, player_2) do
    case turn.name == player_1.name do
      true ->
        player_2

      false ->
        player_1
    end
  end

  defp is_player_win(player_name, board_status) do
    Enum.any?(@winning_index_configurations, fn config ->
      Enum.all?(config, fn con ->
        player_name == Map.get(board_status, String.to_atom(to_string(con))).player
      end)
    end)
  end

  defp is_all_fill(board_status) do
    Enum.all?(board_status, fn board ->
      {_, value} = board
      value.player != nil
    end)
  end
end
