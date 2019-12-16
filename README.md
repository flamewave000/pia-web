# pia-web

## Private Internet Access Remote Web UI

This web UI is meant to interface with the newer `piactl.exe` program that comes with the PIA desktop client. To change how this is referenced, modify the `config.json` file. The `command` field points to the program in a manner fit for your system. I am currently running Node within [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) and referencing the program from there, hence the `mnt/c/...` nonsense. You can also modify the `port` number within the config file.

## The current features:

- Display connection status
- Display currently selected region
- Modify currently selected region
- Connect the client
- Disconnect the client
- HTTPS Support
- Authentication via HTTPS (default password is `password`)

## Getting Started

- Install [NodeJS](https://nodejs.org/en/)
- Clone the repository, or download the source
- From a command line, navigate to the project directory
- Execute the following command: `npm install`
- For the next set of instructions; if you are on Windows, use `pia-web.bat`, otherwise use `pia-web.sh` for Linux/Mac. I will refer to these two files as simply `pia-web*` for the commands below.
- To start the regular server, you can do so with the default settings. Simply double click or run from command line the `pia-web*` file.
- _(Optional)_ __For HTTPS and Authentication__
  - Update the SSL certificates. You can use the example ones that are already defined, but it is recommended you create a new set.)
  - Do this by running the command and following the prompts for information: `pia-web* --gen-cert`
    - NOTE: Make sure to answer `y`es to the final question which will update the config to use the newly generated certificate.
  - Update the currently set authentication password using: `pia-web* --pass`
  - Open the `config.json` file in a regular text editor and find the `enabled` value. Change it from `"enabled": false` to `"enabled": true`. Save the file and exit.
  - Run the server as normal by calling/double clicking the `pia-web*` file.

## Configuration

### file: `config.json`

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
    "use_companion": true,
    /* Hashed password for authentication */
    "password": "a591...146e"
  }
}
```

## HTTPS

If Disabled, the server will start listening on the `http_port` as expected.

If Enabled, The server will start on the `https_port`, __but!__ it will also spawn a secondary companion server on the regular `http_port`. This companion server is meant to redirect traffic from the regular http address, to the https server. This is so if you enter the address into your browser, you don't have to include the "https://.." in front. This can be disabled by setting `use_companion` to `false`.

## Authentication

Only available when HTTPS is enabled.

The config file contains a single password entry that holds a SHA256 hashed password. This can be updated using the [`--pass`](#--pass) command.

## Commands

### `--help`

Displays the following help message:

```
    pia-web.[sh|bat] (command)
    (nothing)   Starts the server.
    --help      Display this help message.
    --pass      Set the server password for HTTPS (saves to config.json)
    --gen-cert  Generate HTTPS key/cert pair
                optional usage: <cmd> --gen-cert <key_name> <cert_name>
                    key_name   Define the key name
                    cert_name  Define the certificate name
```

### `--pass`

Generates a password and stores the result in the `config.json`.

### `--gen-cert`

Generates a self-signed SSL certificate and key. This can be used with HTTPS. At the end of the generation process, it will ask if you wish to use the new certificate. If answered yes, it will update the `config.json` to use the new files.