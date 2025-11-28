defmodule Scdapp.Repo do
  use Ecto.Repo,
    otp_app: :scdapp,
    adapter: Ecto.Adapters.Postgres
end
