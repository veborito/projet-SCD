# Scdapp

To start the server:

* Run `mix deps.get` to install dependencies
* Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

To start multiple server:

example with two nodes:
   * NODES="foo@computer-name,bar@computer-name" PORT=PORT_NUMBER iex --sname foo -S mix phx.server
   * NODES="foo@computer-name,bar@computer-name" PORT=PORT_NUMBER iex --sname bar -S mix phx.server
