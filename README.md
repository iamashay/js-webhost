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

<!-- GETTING STARTED -->
# Getting Started
Follow the steps to run the project in your environment. Since, the project consists of Frontend, API Server, Build Server and the NGINX server, we would be seperately configuring them.

## Prerequisites
* Install and setup Docker to expose docker inorder to utilize the Docker API
  ![docker permission](https://github.com/iamashay/static-webhost/assets/7845033/642148ca-312e-49ea-88e4-784bc60b2930)
* Install NodeJS and NPM
* Install [MKCert](https://github.com/FiloSottile/mkcert) for local SSL on API server

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
