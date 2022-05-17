# MIPT Hyper Ledger Fabric project for creating people assets

## How to use

We follow official HLF test network case. In recent releases there is no opportunity to run your test docker compose instance. So you should install this test network as described [here](https://hyperledger-fabric.readthedocs.io/en/release-2.2/test_network.html). This project uses standart sample channels as in [tutorial for first app](https://hyperledger-fabric.readthedocs.io/en/release-2.2/write_first_app.html)

So when you are done with installation you should replace all javascript originial application and chain code data with the code from this repository respectively. Also you should place `tests.sh` into javascript client directory.

After that you can run
```sh
node tests.sh
```
and see the whole pipeline: creating asset, reading that, updating that, reading the whole change history and finally deleting it.
