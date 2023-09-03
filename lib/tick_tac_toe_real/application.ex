defmodule TickTacToeReal.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      TickTacToeRealWeb.Telemetry,
      # Start the Ecto repository
      # TickTacToeReal.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: TickTacToeReal.PubSub},
      # Start Finch
      {Finch, name: TickTacToeReal.Finch},
      # Start the Endpoint (http/https)
      TickTacToeRealWeb.Endpoint,
      TickTacToeRealWeb.Presence,
      TickTacToeReal.MatchMakingGenServer,
      TickTacToeReal.MatchTableGenServer
      # Start a worker by calling: TickTacToeReal.Worker.start_link(arg)
      # {TickTacToeReal.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: TickTacToeReal.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    TickTacToeRealWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
