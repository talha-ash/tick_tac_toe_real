import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :tick_tac_toe_real, TickTacToeReal.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "tick_tac_toe_real_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :tick_tac_toe_real, TickTacToeRealWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "vFO3fvqvhSD0WjslztXovYiR+GGL3nWppERIau8/7y77njZ0VdypQagOxE2qAN7p",
  server: false

# In test we don't send emails.
config :tick_tac_toe_real, TickTacToeReal.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
