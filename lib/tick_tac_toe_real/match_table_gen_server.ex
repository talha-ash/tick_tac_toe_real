defmodule TickTacToeReal.MatchTableGenServer do
  use GenServer

  def start_link(_), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  @impl true
  def init(_) do
    :ets.new(:matches, [:set, :protected, :named_table, read_concurrency: true])
    {:ok, "ETS Created"}
  end

  def get_match_pid(match_id) do
    GenServer.call(__MODULE__, {:get_match_pid, match_id})
  end

  def insert(match_id, pid) do
    GenServer.cast(__MODULE__, {:insert, {match_id, pid}})
  end

  def remove(match_id) do
    GenServer.cast(__MODULE__, {:delete, match_id})
  end

  @impl true
  def handle_call({:get_match_pid, match_id}, _, state) do
    case :ets.lookup(:matches, match_id) |> Enum.at(0) do
      nil ->
        {:reply, {:error, "Match id not found"}, state}

      {_, pid} ->
        IO.inspect(pid)

        {:reply, {:ok, pid}, state}
    end
  end

  @impl true
  def handle_cast({:insert, {match_id, pid}}, state) do
    :ets.insert_new(:matches, {match_id, pid})
    {:noreply, state}
  end

  @impl true
  def handle_cast({:delete, match_id}, state) do
    :ets.delete(:matches, match_id)
    {:noreply, state}
  end
end
