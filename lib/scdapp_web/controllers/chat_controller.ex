defmodule ScdappWeb.ChatController do
  use ScdappWeb, :controller

  def chat(conn, _params) do
    render(conn, :chat)
  end
end
