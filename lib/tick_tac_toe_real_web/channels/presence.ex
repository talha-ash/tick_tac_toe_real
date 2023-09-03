defmodule TickTacToeRealWeb.Presence do
  @moduledoc """
  Provides presence tracking to channels and processes.

  See the [`Phoenix.Presence`](https://hexdocs.pm/phoenix/Phoenix.Presence.html)
  docs for more details.
  """
  use Phoenix.Presence,
    otp_app: :tick_tac_toe_real,
    pubsub_server: TickTacToeReal.PubSub
end
