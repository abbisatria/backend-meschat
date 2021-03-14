# MESCHAT BACKEND

## Overview

Backend Meschat is an application that is intended to build the server side of the Meschat application

## Installation & Local Run

1. `npm install`
2. `npx nodemon`

## Usage
### Environment Variables
Please refer to the `.env.example` file
```
NODE_ENV=

APP_PORT=
APP_URL=

DB_HOST=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

### Response
```json
{
  "status"  : "200, 400, 401, 404"
  "success" : true or false,
  "message" : "Success or failed",
  "results" : [{ "results" }]
}
``` 