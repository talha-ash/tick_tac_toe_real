defmodule TickTacToeRealWeb.GameZoneRoomChannel do
  use Phoenix.Channel
  alias TickTacToeRealWeb.Presence
  alias TickTacToeReal.MatchMakingGenServer

  def join("gamezone:lobby", message, socket) do
    name = Map.get(message, "name")
    list = Presence.list(socket)

    case Map.has_key?(list, name) do
      true ->
        {:error, %{reason: "Required Unique Name"}}

      false ->
        send(self(), :after_join)
        {:ok, %{name: name, online_at: ""}, assign(socket, :name, name)}
    end
  end

  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.name, %{
      online_at: inspect(System.system_time(:second))
    })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info({:match_found, match}, socket) do
    broadcast(socket, "match_found", %{
      players: Enum.map(match.players, fn player -> player.name end),
      match_id: match.match_id
    })

    {:noreply, socket}
  end

  def handle_in("play_game", %{"name" => name}, socket) do
    # broadcast!(socket, "new_msg", %{body: body})
    MatchMakingGenServer.add_player(name)
    {:reply, {:ok, %{}}, socket}
  end
end
