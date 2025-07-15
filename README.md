# NETFLIX CLONE HOSTED ON AMAZON EKS USING DEVSECOPS PIPELINE #

Deployed a Netflix CLone application as a Docker Container on Kubernetes Cluster through a secured CI/CD pipeline using Jenkins. 

## Project Architecture ##

Outline: 

We start with creating an EC2 instance and deploying the app locally using docker container. Once the application is up and running locally, we will integrate security using sonarqube and trivy. Then we will automate this entire process manually using a CI/CD tool Jenkins, which will automate the creation of secured Docker Image and will be uploaded on the Docker hub. Now, Prometheus and Grafana will be added for monitoring, which will monitor the ec2 instance as well as in Jenkins to check the successfull jobs, failed jobs, etc and along with this we have email notification to get the up to date successful and failed jobs in Jenkins using SMTP. Finally we will deploy this app on Kubernetes using Argo CD (the GitOps tool) & we will have monitoring on our Kubernetes cluster which is going to be installed through helm charts. 

<img width="1608" height="1364" alt="image" src="https://github.com/user-attachments/assets/cfb70a61-1642-4029-8d13-28e6690427ee" />

## utilities used : ##

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

#### Launch EC2 (Ubuntu 22.04):

- Provision an EC2 instance on AWS with Ubuntu 22.04. (opted for t2.large instance - because to deal with the installation of lot of plugins, and tools)
  * Name : Netflix-jenkins
  * AMI: ubuntu 22.04
  * type: T2.large (not free tier)
  * Key pair: Used the existing Key pair
  * for the network settings: used the default vpc & subnet.
  * Security group: create a new security group with ports open for SSH, HTTPS, and HTTP.
   (later ports will be added for app, Jenkins, sonar qube)
  * storage: 25 GiB
  * click on "launch Instance"

- Create an Elastic IP address
  Network & security > Elastic IPs > click on allocate Elastic IP
  -- Elastic Ip settings --
  Network Border group : us-east-1 (Mention the region of the instance)
  Public IPv4 address Pool : Amazon's pool of IPV4 addresses
  Click allocate
  Name the Elastic IP address and save it > click on associate Elastic IP address > resource type: Instance > select the instance which you have created (netflix-    jenkins)>click associate. This will attach the Elastic IP to the netflix-Jenkins instance.

- Connect to the instance using SSH.
  Click the netflix-jenkins instance > click on connect > choose EC2 instance connect > click Connect. Now we will be inside the server.
  Update the packages ``` sudo apt update -y ```

  

