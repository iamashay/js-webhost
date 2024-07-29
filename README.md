# JS Webhosting
A webhosting project where you can host your static HTML project or ReactJS project over the web. 

# Demo
![Deployment animated demo}](/demo-assets/deploy-anim.gif)
<img src="/demo-assets/deployment.png" height="200px" width="600px" alt="Deployment page" />

# Built With
* NextJS (Frontend)
* Docker (Building and deploying projects)
* NGINX (Reverse proxying projects to unique subdomains)
* PostgreSQL 
* ExpressJS (REST APIs)
* RabbitMQ (queuing projects' deployment)

<!-- GETTING STARTED -->
# Getting Started
Follow the steps to run the project in your environment. Since, the project consists of Frontend, API Server, Build Server and the NGINX server, we would be seperately configuring them. These steps are shown for Windows. Steps may differ for any other operating systems.

First download the project in your local:
```console
git clone https://github.com/iamashay/static-webhost.git
```

## Prerequisites
* Install and setup Docker to expose docker inorder to utilize the Docker API
  ![docker permission](https://github.com/iamashay/static-webhost/assets/7845033/642148ca-312e-49ea-88e4-784bc60b2930)
* Install NodeJS and NPM
* Install [MKCert](https://github.com/FiloSottile/mkcert) for local SSL on API server
* Setup RabbitMQ Server (can be hosted free online at [cloudamqp](https://www.cloudamqp.com/))

## Setup MKCert
MKCert has to be used inorder to make locally signed certificates as trusted. The API Server will use the certificate to allow secure HTTPS connection. 

* Download [MKCert](https://github.com/FiloSottile/mkcert/releases)
* go to the folder where you downloaded MKCert and rename it to mkcert
* Open CMD in that folder, and generate certificates for the domains (localhost or any other)
  ```console
  ./mkcert 127.0.0.1 localhost
  ```
* After generating the certificates, install the local Certificate Authority (CA)
  ```console
  ./mkcert -install
  ```

## Database Configs
* Install all the modules
  ```npm
  npm install
  ```
* Edit the .env.example file with your configs and rename it to .env
* Drizzle Kit can be used to push schema changes to the database.

## API Server
* Move the certs generated earlier to security folder and replace them with the existing ones. Make sure to rename the newly generated certs with the same name of existing files.
* Install all the modules
  ```npm
  npm install
  ```
* Edit the .env.example file with your configs and rename it to .env
* Start the server with
  ```console
  npm run start
  ```
* The server will start on https://localhost:3000

## Build Server
* Install all the modules
  ```npm
  npm install
  ```
* Edit the .env.example file with your configs and rename it to .env
* Run the command to build required docker images from dockerfile
  ```
  cd build-server/docker
  docker build . -f Static.Dockerfile -t static-image;
  docker build . -f React.Dockerfile -t react-image;
  ```
* Start the server with
  ```console
  npm run start
  ```
## Frontend Client
* Install all the modules
  ```npm
  npm install
  ```
* Start frontend client with
  ```npm
  npm run dev
  ```
* The client will start on http://localhost:4000

## NGINX Reverse Proxy Server
This has been dockerized to reduce complexity. You only need to follow few steps.
* In the docker-compose.yaml file, replace the two environment variables:
  ```console
    NGINX_SERVER_NAME=<your domain name where you want to run the nginx server>
    R2_STORAGE_LINK=<your R2 storage public link>
  ```
* Run the cmd to start the nginx server with Docker
  ```console
  docker compose up
  ```
## License

Distributed under the GNU GPLv2. See `LICENSE.txt` for more information.
  
