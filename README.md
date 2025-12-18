# Scdapp

To start the server:

* Run `mix deps.get` to install dependencies
* Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

To start multiple server:

Run each command in a different terminal
```bash
NODES="foo@computer-name,bar@computer-name" PORT=PORT_NUMBER iex --sname foo -S mix phx.server
```
```bash
NODES="foo@computer-name,bar@computer-name" PORT=PORT_NUMBER iex --sname bar -S mix phx.server
```

With computer-name being the name the current node your testing the app. And PORT_NUMBER a chosen port number (should be two diffrent values, ex: 4000 and 4001)
