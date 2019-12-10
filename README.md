# pia-web

### Private Internet Access Remote Web UI

This web UI is meant to interface with the newer `piactl.exe` program that comes with the PIA desktop client. To change how this is referenced, modify the `config.json` file. The `command` field points to the program in a manner fit for your system. I am currently running Node within [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) and referencing the program from there, hence the `mnt/c/...` nonsense. You can also modify the `port` number within the config file.

#### The current features:

- Display connection status
- Display currently selected region
- Modify currently selected region
- Connect the client
- Disconnect the client
