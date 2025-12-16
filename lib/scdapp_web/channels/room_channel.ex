defmodule ScdappWeb.RoomChannel do
  use Phoenix.Channel
  alias ScdappWeb.Presence

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
    crdt = Scdapp.Application.lookup_crdt(Atom.to_string(Node.self()))
    DeltaCrdt.put(crdt, "canvas", body)
    {:reply, socket}
  end

  def handle_in("new_pos", %{"body" => body}, socket) do
    broadcast!(socket, "new_pos", %{body: body})
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.name, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
end
