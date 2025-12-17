defmodule ScdappWeb.RoomChannel do
  use Phoenix.Channel
  alias ScdappWeb.Presence
  require Logger

  @crdt_name Atom.to_string(Node.self())

  def join("room:lobby", %{"name" => name}, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :name, name)}
  end

  def join("room:canvas",_, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body})
    curr_messages = Scdapp.Crdt.get(@crdt_name, "messages") || []
    Scdapp.Crdt.put(@crdt_name, "messages", curr_messages ++ [body])
    {:reply, :ok, socket}
  end

  def handle_in("new_pos", %{"body" => body}, socket) do
    broadcast!(socket, "new_pos", %{body: body})
    Scdapp.Crdt.put(@crdt_name, "canvas", body)
    {:reply, :ok, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: inspect(System.system_time(:second))
      })

    messages = Scdapp.Crdt.get(@crdt_name, "messages") || []
    canvas = Scdapp.Crdt.get(@crdt_name, "canvas") || []
    push(socket, "presence_state", Presence.list(socket))
    push(socket, "messages", %{id: 1, content: messages})
    push(socket, "canvas", %{id: 2, content: canvas})
    {:noreply, socket}
  end
end
