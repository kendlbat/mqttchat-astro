# NSCS - MQTT Chat App

## Mosquitto

### Adding / modifying users

```sh
docker compose exec mosquitto mosquitto_passwd -c -b /mosquitto/config/mosquitto.passwd username password
```
