
# Event Logger

This event logger was built for a lightweight event log and reporting purposes. The philosophy behind this API is that a mobile app will send events to `/api/v1/event/heartbeat` API with the following parameters:

- `msisdn=8801XXXXXXXXX`// user identifier
- `version=1.0.0`       // app version
- `platform=android`    // app platform `eg: (android|ios)`
- `event=sample_event_name` // a unique event name which the we are interested to track
- `identifier=ABC123` // any kind of content id `eg: C3P0`
- `source=sample_event_source` // event source 

This "event" is then logged and aggregated using the lightest possible system (nginx, fluentd and elasticsearch) and, from there we could then easy dump raw data, build dashboards and do other stuff that our wild imagination can perceive.

## Installation

To run this project you will need the following

- `git`
- `docker` and `docker-compose` installed
- any code editor/IDE of your choice (optional)
### Step 1
Clone the git repo from 
[[github]](https://github.com/muttalebm/nginx-event-collector.git)

```
cd /path/to/folder/
git clone https://github.com/muttalebm/nginx-event-collector.git
cd nginx-event-collector
```

### Step 2
Rename the .env.example file to .env in deploy folder
```
cd deploy
mv .env.example .env
```
Review the .env file. Check the `Service Settings` section for any changes in the below configurations

```
#############################################################
# Services Settings
#############################################################

# Web Service
WEB_HTTP_PUBLISH_PORT=8121
WEB_HTTPS_PUBLISH_PORT=8122

## Where the log dumper application will be stored inside the container
WORK_DIR_PATH=/usr/src/app

## Any debug tool you might need
DEBUG_TOOLS=nano telnet

## Fluentd image version
FLUENTD_IMAGE_VERSION=v1.16.2-debian-1.0

## Nginx image version
NGINX_IMAGE_VERSION=1.25.2

## password for ES and Kibana
KIBANA_PASSWORD=default@123
ELASTIC_PASSWORD=default@123

## Fluentd Host
FLUEND_HOST=host.docker.internal
```

### Step 3

Build the docker image and run the services in background mode
```
docker compose build && docker compose up -d
docker compose logs -f
```

At first you will see a lot of logs and even some errors showing fluentd is unable to reach elasticsearch. I would suggest give it some time so that elasticsearch and kibana is intiated. If problem persists check if kibana can be accessed from your web browser  [http://localhost:5601](http://localhost:5601) 


### Step 4
Now it's time to generate some logs. The nginx web application will expose an API endpoint where clients can send their logs

#### Sample Request

```
curl --location 'https://host.docker.internal:8122/api/v1/event/heartbeat?msisdn=FR3780700740043126777448625&version=225&platform=maroon&event=toffee_time&identifier=24462728&source=toffee' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer <secret>'
```
Nginx is configured to write an access log to stdout which is then read by fluentd through docker log driver. Fluentd then parses the log and ships to ES

### Step 5 (optional)
!! Work in progress !!

Run the log dumper which takes below arguments to and generates your desired csv dump. The dump will be available in your host machine's application folder.


# Contributing

Thank you for investing your time in contributing to our project! :sparkles:.

To contribute to this project, please 
- fork the repo
- make changes locally
- review your changes
- create PR
