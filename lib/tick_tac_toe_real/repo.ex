defmodule TickTacToeReal.Repo do
  use Ecto.Repo,
    otp_app: :tick_tac_toe_real,
    adapter: Ecto.Adapters.Postgres
end
