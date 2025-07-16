# NETFLIX CLONE HOSTED ON AMAZON EKS USING DEVSECOPS PIPELINE #

Deployed a Netflix CLone application as a Docker Container on Kubernetes Cluster through a secured CI/CD pipeline using Jenkins. 

## Project Architecture ##

Outline: 

We start with creating an EC2 instance and deploying the app locally using docker container. Once the application is up and running locally, we will integrate security using sonarqube and trivy. Then we will automate this entire process manually using a CI/CD tool Jenkins, which will automate the creation of secured Docker Image and will be uploaded on the Docker hub. Now, Prometheus and Grafana will be added for monitoring, which will monitor the ec2 instance as well as in Jenkins to check the successfull jobs, failed jobs, etc and along with this we have email notification to get the up to date successful and failed jobs in Jenkins using SMTP. Finally we will deploy this app on Kubernetes using Argo CD (the GitOps tool) & we will have monitoring on our Kubernetes cluster which is going to be installed through helm charts. 

<img width="1608" height="1364" alt="image" src="https://github.com/user-attachments/assets/cfb70a61-1642-4029-8d13-28e6690427ee" />

## Utilities used : ##

Jenkins: Continuous Integration and Continuous Deployment (CI/CD)
Docker: Containerization
Kubernetes: Container Orchestration
Prometheus: Monitoring and Alerting
Grafana: Visualization and Dashboards
SonarQube: Static Code Analysis
OWASP Dependency-Check: Dependency Vulnerability Scanning
Trivy: Container Image Vulnerability Scanning
Node Exporter: System Metrics Collection

## Steps Overview 

### 1. Initial Setup and Deployment

1. Launch EC2 Instance
2. Clone Application Code from Git repo
3. Install Docker on Ec2 
4. Create Dockerfile
5. Get the API Key from TMDB
6. Build Docker Image

### 2. Security Scanning

1. Install SonarQube and Trivy
2. Integrate SonarQube with CI/CD Pipeline
3. Install OWASP Dependency Check Plugins in Jenkins
4. Configure Dependency-Check Tool

### 3. Continuous Integration and Continuous Deployment (CI/CD) with Jenkins

1. Install Jenkins
2. Install Necessary Plugins in Jenkins
3. Configure SonarQube Server in Jenkins
4. Configure CI/CD Pipeline in Jenkins
5. Add DockerHub Credentials in Jenkins
6. Configure Dependency-Check and Trivy Scans in Pipeline

### 4. Monitoring Setup

1. Install Prometheus
2. Install Node Exporter
3. Configure Prometheus to Scrape Metrics
4. Install Grafana
5. Add Prometheus Data Source in Grafana
6. Import Pre-configured Dashboards in Grafana
7. Configure Prometheus Plugin Integration in Jenkins

### 5. Kubernetes Setup

1. Install Kubectl on Jenkins Machine
2. Setup Master and Worker Instances
3. Initialize Kubernetes on the Master Node
4. Join Worker Node to Kubernetes Cluster
5. Handle Config Files for Jenkins
6. Install Kubernetes Plugins on Jenkins
7. Install Node Exporter on Master and Worker Nodes

## Detailed Steps 

### Phase 1: Initial Setup and Deployment (DEV PART)

#### **Provision an EC2 instance on AWS with Ubuntu 22.04.** (opted for t2.large instance - because to deal with the installation of lot of plugins, and tools)
  * Name : Netflix-jenkins
  * AMI: ubuntu 22.04
  * type: T2.large (not free tier)
  * Key pair: Used the existing Key pair
  * for the network settings: used the default vpc & subnet.
  * Security group: create a new security group with ports open for SSH, HTTPS, and HTTP.
   (later ports will be added for app, Jenkins, sonar qube)
  * storage: 25 GiB
  * click on "launch Instance"
    
   <img width="2368" height="1159" alt="image" src="https://github.com/user-attachments/assets/77ab07f5-a06c-4c4b-a2b8-d8c731622268" />
   <img width="2316" height="1145" alt="image" src="https://github.com/user-attachments/assets/cf260e50-66e0-4e3a-8272-284f7fee27e9" />
   <img width="2267" height="1095" alt="image" src="https://github.com/user-attachments/assets/2b7cb960-b7b3-49ce-8479-487b03879bf3" />


#### **Create an Elastic IP address**
  * Network & security > Elastic IPs > click on allocate Elastic IP
  -- Elastic Ip settings --
  * Network Border group : us-east-1 (Mention the region of the instance)
  * Public IPv4 address Pool : Amazon's pool of IPV4 addresses
  * Click allocate
  * Name the Elastic IP address and save it > click on associate Elastic IP address > resource type: Instance > select the instance which you have created (netflix-jenkins)     > click associate. This will attach the Elastic IP to the netflix-Jenkins instance.

  <img width="2221" height="1097" alt="image" src="https://github.com/user-attachments/assets/e271daf7-f13a-40c7-a3ae-a93cb6c86695" />

#### **Connect to the instance using SSH**
  * Click the netflix-jenkins instance > click on connect > choose EC2 instance connect > click Connect. Now we will be inside the server.
  * Update the packages ``` sudo apt update -y ```
 
#### **Clonning the repo**
  * Go to the git repo and clone the repo
  * Now run ``` git clone <url of the repo> ```
  * after clonning, you can do ls to see your project repo and do cd command to move into that folder. In my case. it's ``` cd DevSecOps-Project ```
  * Inside the DevSecOps project, if you do ``` ls ``` , you will see the entire list of files of the project. 
  * we have a Docker file in this project, So to create a Docker image we need to first install Docker on EC2.

#### **Installation of Docker**
  * ``` sudo apt-get update # updating all the upackages
        sudo apt-get install docker.io -y   # Install Docker
        sudo usermod -aG docker $USER       # Replace with your system's username, e.g., 'ubuntu' # Adding Ubuntu User to the Docker group for accessing Docker Daemon
        newgrp docker
        sudo chmod 777 /var/run/docker.sock # changing file permissions
    ```
  * verify the Docker ``` docker version ```
 
#### **Build and run the app locally**
  * Docker build command : ``` docker build -t netflix . ```
  * Once the image has been built, verify it ``` docker images ```
  * you should be able to see the REPOSITORY name as 'netflix', along with TAG, IMAGE ID, CREATED TIME, and SIZE. 
  * In our Docker file we are having an arguemnt - ARG TMDB_V3_API_KEY, the api key has to be passed during the docker build command. (since I'm locally testing it, I    haven't given any api key so far, so upon accessing the application I am expecting a blank page for now)
  * Docker run:  ``` docker run -d -p 8081:80 <IMAGE ID OF THE NETFLIX> ```
  * This will spin a container.
  * Go to the browser and copy the paste the Public Ip address of the ec2 instance(netflix-jenkins) and port number to access the app. Make sure that you have added port   8081 onto your security group. Go to security group of the instance > inbound rules > edit inbound rules > add Custom TCP, port as '8081', source as 'Anywhere IPV4', and provide a description as 'app port'.
  * Now if hit the browser, you should be able to see the app running- A complete blank page with Netflix name 


#### **Creation of TMDB account and accessing API KEY**
 * The application which we are creating has list of series, movies, documentaries, etc on netflix and we want to have an api that fetches these movies/series/documentaries from TMDB and put it on our application. 
 * TMDB - The Movie Database : this is the place where we can get the APi to fetch all the movies and series from here into our app. 
 * TMDB LINK: https://www.themoviedb.org/
 * create an account with TMDB : open TMDB > click 'signup' > fill the details. 
<img width="2498" height="1262" alt="image" src="https://github.com/user-attachments/assets/e1efca47-5cec-45fc-b24f-4c26577cd5b7" />
 * Go to settings option > API > click on API key and generate it and copy the API key.

#### **using the API key in our Docker build and testing the application**
 * first, Let's Stop all the running containers.
 * To verify that : ``` docker ps ``` , this should show the list of the containers that are running.
 * To stop the container :
    ``` docker stop <image id> ```
    ``` docker rm <image id> ```
 * once again you can do ``` docker ps ``` to verify if there are any running containers.
 * recreate the docker image with api key :
   ```
   docker build --build-arg TMDB_V3_API_KEY=<your-api-key> -t netflix .
   ```
 * Paste the api key on the build command
 * This will create a new docker image now. This time it wont take much time for creation because Docker images are built on layers and they will create only the layer which has been newly added.
 * Do ``` docker images ``` to check whether the new docker image is created or not.
 * Docker run : ``` docker run -d -p 8081:80 netflix ```
 * This will give a sha output (meaning - A container is up and running )
 * Go to the browser and copy the paste the Public Ip address of the ec2 instance(netflix-jenkins) and port number to access the app. you shpuld be able to see all the content being getting displayed on the application.
<img width="2269" height="1239" alt="image" src="https://github.com/user-attachments/assets/6b27db36-2b1d-46ae-b1c2-c4684c1f79c8" />
<img width="2279" height="1241" alt="image" src="https://github.com/user-attachments/assets/95af5d39-3320-4180-a8fb-bd824d0b954b" />
Our application is running properly on the local machine . Let's go ahead and integrate security part.

### Phase 2: Security Scanning (SEC PART)

#### Installing Sonarqube 
Sonar qube: Soanrqube is a code quality assurance tool that collects and analyses source code, and provides reports for the code quality of your project. 
 * We are gonna run the Sonarqube as a Docker container
 * ''' docker run -d --name sonar -p 9000:9000 sonarqube:lts-community ```
 * This will fetch sonarqube image from Docker hub.
 * verify using ''' docker ps ```
 * this should bring up two containers, one is for sonarqube running on port 9000 and another one is for our application running on port 8081.
 * Let's add Sonar qube port number on security group : Go to security group of the instance > inbound rules > edit inbound rules > add Custom TCP, port as '9000', source as 'Anywhere IPV4', and provide a description as 'sonarqube port ', click save.
 
#### Accessing and logging into Sonarqube
 * on the browser, copy the public IP address of the ec2 instance and the port number of the sonarqube, hit enter.
 * You will see the Sonarqbe page. It takes some time to load the page.
 * It prompts you for username and password. For the first time both username and password is admin.
 * Once you login, it will prompt you to change the password. Provide a new password and update it.
<img width="2263" height="1241" alt="image" src="https://github.com/user-attachments/assets/ea871da4-0020-4a67-a4e5-696683c35c1a" />


#### Installing Trivy
 * Trivy : The most popular open source security scanner for scanning vulnerabilities, also to check Docker images and auto scan file systems.
 * To install :
   
```
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy  
```
 * This will install the trivy, and after installation you can verify this by running ``` trivy version ```

#### Performing Trivy Scan 
 * To perform trivy scanning on the project files - Go to your project repo > cd DevSecOps-Projects
 * If you do ``` ls ``` , you can all the files within the project repo.
 * run :
```
trivy fs .
```
 * This will scan the current file system and it gives you a report as well with severity of the vulnerability and some additional info
 * To perform trivy on the docker images, do:
```
trivy <image id>
```
 * Once scanned, trivy will give a report which will say the vulnerabilities and its severity classes such as low, medium, high and critical.


### Phase 3: CI/CD setup (OPS PART)

#### Installing Jenkins
For the CI/CD, we will be using JENKINS as the orchestrator. 
Pre-requisites: Jenkins requires Java for Installation. 

 * Installating Java :
```
sudo apt update
sudo apt install fontconfig openjdk-17-jre
java -version
openjdk version "17.0.8" 2023-07-18
OpenJDK Runtime Environment (build 17.0.8+7-Debian-1deb12u1)
OpenJDK 64-Bit Server VM (build 17.0.8+7-Debian-1deb12u1, mixed mode, sharing)
```
 * Installing Jenkins :
```
#jenkins
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
/etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins 
```
 * To verify the Installation, run ``` Sudo service Jenkins status ```. If the status is running then the Jenkins installation is successful.
 * Add Jenkins to the Docker group for daemon access : ``` sudo usermod aG docker Jenkins ``` 
 * Let's add jenkins port number on security group : Go to security group of the instance > inbound rules > edit inbound rules > add Custom TCP, port as '8080', source as 'Anywhere IPV4', and provide a description as 'Jenkins port '.

#### Accessing Jenkins   
 * Once the installation is done, you can access the Jenkins on the browser as <publicIP address of the instance>:8080
 * You will be prompted with 'getting started page' on Jenkins, and asks you to enter 'administrator password'
   <img width="2272" height="1242" alt="image" src="https://github.com/user-attachments/assets/3d035aed-6004-4ce1-9fb9-25a3059c52c0" />
 * The password is always stored in this path : /var/lib/jenkins/secrets/initialAdminPassword
 * Go back to your terminal and enter ``` sudo cat /var/lib/jenkins/secrets/initialAdminPassword ``` 
 * This give you the password as the o/p. copy the password and paste it on the browser > administrator password
 * Next, it will prompt you for installing Plugins, Go with 'Install suggested plugins'
 * Jenkins will install the suggested plugins (this may take some time)
   


   


  

