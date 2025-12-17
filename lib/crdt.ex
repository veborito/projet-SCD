defmodule Scdapp.Crdt do
  alias Scdapp.Application

  def put(crdt_name, key, value) do
    pid = Application.lookup_crdt(crdt_name)
    DeltaCrdt.put(pid, key, value)
  end

  def get(crdt_name, key) do
    pid = Application.lookup_crdt(crdt_name)
    DeltaCrdt.get(pid, key)
  end

  def to_map(crdt_name) do
    pid = Application.lookup_crdt(crdt_name)
    DeltaCrdt.to_map(pid)
  end

  def set_neighbour(crdt_name, neighbour_name) do
    crdt_pid = Application.lookup_crdt(crdt_name)
    neighbour_pid = Application.lookup_crdt(neighbour_name)
    DeltaCrdt.set_neighbours(crdt_pid, [neighbour_pid])
  end

  def set_neighbours(name) do
    for node <- Node.list() do
      set_neighbour(name, Atom.to_string(node))
      set_neighbour(Atom.to_string(node), name)
    end
  end
end
