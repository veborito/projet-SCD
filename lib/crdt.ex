defmodule Scdapp.Crdt do
  alias Scdapp.Application

  def put(crdt_name, key, value) do
    pid = Application.lookup_crdt(crdt_name)
    DeltaCrdt.put(pid, key, value)
  end

  def to_map(crdt_name) do
    pid = Application.lookup_crdt(crdt_name)
    DeltaCrdt.to_map(pid)
  end

  def set_neighbours(crdt_name, neighbour_name) do
    crdt_pid = Application.lookup_crdt(crdt_name)
    neighbour_pid = Application.lookup_crdt(neighbour_name)
    DeltaCrdt.set_neighbours(crdt_pid, [neighbour_pid])
  end
end
