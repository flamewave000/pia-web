# pia-web

### Private Internet Access Remote Web UI

This web UI is meant to interface with the newer `piactl.exe` program that comes with the PIA desktop client. To change how this is referenced, modify the `config.json` file. The `command` field points to the program in a manner fit for your system. I am currently running Node within [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) and referencing the program from there, hence the `mnt/c/...` nonsense. You can also modify the `port` number within the config file.

#### The current features:

- Display connection status
- Display currently selected region
- Modify currently selected region
- Connect the client
- Disconnect the client
- HTTPS Support

#### Configuration

##### file: `config.json`

```jsonc
{
  /* path to the `piactl.exe` program the server is to use for controlling the PIA Client */
  "command": "/mnt/c/Program\\ Files/Private\\ Internet\\ Access/piactl.exe",
  /* Host address for the servers to run on */
  "host": "localhost",
    /* Specify servers should prevent port sharing */
  "exclusive": false,
  "http": {
    /* Port address for the regular HTTP server to listen on (and companion server when HTTPS is enabled) */
    "port": 8080
  },
  "https": {
    /* If `true`, HTTPS will be enabled */
    "enabled": false,
    /* Port address for the HTTPS server to listen on */
    "port": 8443,
    /* HTTPS Security Key */
    "key": "./certs/example-key.pem",
    /* HTTPS Security Certificate */
    "cert": "./certs/example-cert.pem",
    /* If true, a companion HTTP server will be started to soley redirect traffic to the HTTPS server */
    "use_companion": true
  }
}
```

#### HTTPS

If Disabled, the server will start listening on the `http_port` as expected.

If Enabled, The server will start on the `https_port`, __but!__ it will also spawn a secondary companion server on the regular `http_port`. This companion server is meant to redirect traffic from the regular http address, to the https server. This is so if you enter the address into your browser, you don't have to include the "https://.." in front. This can be disabled by setting `use_companion` to `false`.
