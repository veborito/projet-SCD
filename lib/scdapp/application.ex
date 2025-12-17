defmodule Scdapp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false
  use Application

  @impl true
  def start(_type, _args) do

    children = [
      ScdappWeb.Telemetry,
      {Registry, name: Scdapp, keys: :unique},
      {DynamicSupervisor, name: Scdapp.CrdtSupervisor, strategy: :one_for_one},
      {Task.Supervisor, name: Scdapp.TaskSupervisor},
      {DNSCluster, query: Application.get_env(:scdapp, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Scdapp.PubSub},
      # Start a worker by calling: Scdapp.Worker.start_link(arg)
      # {Scdapp.Worker, arg},
      # Start to serve requests, typically the last entry
      ScdappWeb.Endpoint,
      ScdappWeb.Presence,
    ]

    opts = [strategy: :one_for_one, name: Scdapp.Supervisor]
    supervisor = Supervisor.start_link(children, opts)

    for node <- Application.fetch_env!(:scdapp, :nodes) do
      Node.connect(node)
    end

    create_crdt(Atom.to_string(Node.self()))

    supervisor
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ScdappWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  def create_crdt(name) do
    DynamicSupervisor.start_child(
      Scdapp.CrdtSupervisor,
      {
        DeltaCrdt,
        name: via(name),
        crdt: DeltaCrdt.AWLWWMap
      }
    )
  end

  def lookup_crdt(name), do: GenServer.whereis(via(name))

  defp via(name), do: {:global, name}
end
