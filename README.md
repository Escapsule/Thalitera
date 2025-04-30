# Thalitera - Meeting Room Reservation System

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Technology Stack

### Frontend Ecosystem
[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-5.24.0-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query/latest)

### Backend Ecosystem
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.2.3-6DB33F?logo=spring-security)](https://spring.io/projects/spring-security)
[![MyBatis Plus](https://img.shields.io/badge/MyBatis_Plus-3.5.5-2D6399?logo=apache&logoColor=white)](https://baomidou.com/)
[![Lombok](https://img.shields.io/badge/Lombok-1.18.36-pink?logo=lombok)](https://projectlombok.org/)
[![Swagger](https://img.shields.io/badge/Swagger-3.0.0-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)

### Data Layer
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.0-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2.4-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![MinIO](https://img.shields.io/badge/MinIO-RELEASE.2024-2891F1?logo=minio&logoColor=white)](https://min.io/)

### DevOps & Infrastructure
[![Docker](https://img.shields.io/badge/Docker-25.0.3-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.30-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Nginx](https://img.shields.io/badge/Nginx-1.25.4-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![Prometheus](https://img.shields.io/badge/Prometheus-2.51.0-E6522C?logo=prometheus)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-11.0.0-F46800?logo=grafana)](https://grafana.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-3.8.0-2088FF?logo=github-actions)](https://github.com/features/actions)

## Project Overview

**Thalitera** revolutionizes institutional resource management through a modern web-based reservation system. Combining enterprise-grade security with delightful UX, we deliver:

<div align="center">
  <img src="https://img.shields.io/badge/-Cyber_Secured-4EC820?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Security">
  <img src="https://img.shields.io/badge/-GDPR_Compliant-003366?style=for-the-badge&logo=gdpr&logoColor=white" alt="GDPR">
  <img src="https://img.shields.io/badge/-Zero_Trust-FF6D01?style=for-the-badge&logo=cisco&logoColor=white" alt="Zero Trust">
</div>


### Core Capabilities ✨ 

| **Intelligent hub** 🧠             | **Security bastion** 🔐              | **Efficiency Engine** ⚡    |
| --------------------------------- | ----------------------------------- | -------------------------- |
| 🎯 Fast Conflict Detection         | 🔑 2FA Authentication (TOTP/SMS)     | 🚀 500ms API Response SLA   |
| 📊 Real-time Availability Heatmaps | 🛡️ End-to-End Encryption (AES-256)   | 📦 Containerized Deployment |
| 🌐 Multi-language Support          | 🔍 Audit Logging & Anomaly Detection | 🧩 Modular Architecture     |
| 🤖 Cache Integration for Queries   | 🚨 Brute Force Protection            | 🛠️ DevOps Automation        |

### Key Highlights 🌈 
- **🔒 Military-Grade Security**  
  ![2FA](https://img.shields.io/badge/2FA_Methods-TOTP%2FWebAuthn-3DDC84?logo=authenticator)  
  Multi-layered protection with optional FIDO2 biometric authentication

- **🌍 Universal Access**  
  ![Accessibility](https://img.shields.io/badge/WCAG_2.1_AA_Compliant-17A2B8?logo=accessibility)  
  Full keyboard navigation & screen reader support

**Architecture Philosophy**:  

> "⚖️ **Balance Through Contrast**" - Where **Next.js'** fluid interactivity (⚡92 Lighthouse) meets **Spring Boot's** ironclad reliability (99.999% uptime), wrapped in **Tailwind CSS'** pixel-perfect aesthetics.

## Deployment Guide 🚀 

### Prerequisites
- Docker 24.0.6+
- Docker Compose 2.23.0+
- SSL certificates (fullchain.pem & privkey.pem)

### Step 1: Clone Repository
```bash
git clone https://github.com/Escapsule/Thalitera
cd thalitera
```

### Step 2: Prepare SSL Certificates

```bash
mkdir -p ./ssl  # Create a certificate directory.
# Rename your certificate file to:
# - fullchain.pem
# - privkey.pem
# And put it in the ssl directory.
```

### Step 3: Configure `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    environment:
      # Mail configuration (SMTP) 163 for example
      - MAIL_HOST=smtp.163.com
      - MAIL_USERNAME=your-email@163.com
      - MAIL_PASSWORD=your-token
      
      # your domain
      - BASE_URL=https://your-domain.com
      
      # MinIO configuration (modify according to actual deployment)
      - OSS_ENDPOINT=http://minio:9000       # MinIO access address
      - OSS_ACCESS_KEY=  
      - OSS_SECRET_KEY=    
      - OSS_BUCKET=          				# bucket name

  nginx:
    volumes:
      - ./ssl/fullchain.pem:/etc/nginx/ssl/fullchain.pem
      - ./ssl/privkey.pem:/etc/nginx/ssl/privkey.pem
```

### Step 4: Initialize `MinIO` (Required for first deployment)

1. Visit `http://your-minio-domain.com:9000` (Default port 9000)
2. Log in using the credentials which your set：
   - Access Key
   - Secret Key
3. Create a storage bucket.

### Step 5: Start the service

```bash
# Build and start a container.
docker-compose up -d --build

# View real-time logs.
docker-compose logs -f
```

>  Key configuration instructions 🔧
>
> Recommendations for `MinIO`production environment
>
> 1. **Independent deployment**: It is recommended to deploy `MinIO` on an independent server.
>
> 2. **Deploy by Docker:**
>
>    ```yaml
>    version: '3'
>    services:
>      minio:
>        image: quay.io/minio/minio
>        ports:
>          - "9000:9000"
>          - "9001:9001"
>        volumes:
>          - /data:/data
>          - ./ssl/your-domain.com.pem:/root/.minio/certs/public.crt:ro
>          - ./ssl/your-domain.com:/root/.minio/certs/private.key:ro # https needed
>        environment:
>          - MINIO_ROOT_USER=your_root_user
>          - MINIO_ROOT_PASSWORD=your_password
>          - MINIO_API_CORS_ALLOW_ORIGIN=your-domain.com # recommended to configure in the production environment.
>          - MINIO_API_CORS_ALLOW_METHODS=GET,PUT,POST,DELETE,HEAD
>          - MINIO_API_CORS_ALLOW_HEADERS=*
>          - MINIO_API_CORS_EXPOSE_HEADERS=ETag
>          - MINIO_API_CORS_MAX_AGE=3000
>        command: server /data --console-address ":9001" # web ui port
>        restart: always
>    
>    ```



# Backend Development Guide 💻 

## Prerequisites

- JDK 17+
- Maven 3.9+
- IntelliJ IDEA (2023.2+ recommended)
- Docker Desktop (for local DB)

## Setup Development Environment

```bash
git clone https://github.com/Escapsule/Thalitera
cd thalitera/thalitera-backend
```

## Create Development Configuration

- Create `application-dev.yml` at:

  ```bash
  server/src/main/resources/application-dev.yml
  ```

- Configure with your local settings:

  ```yaml
  spring:
    config:
      base-url: http://xxxxx.xxx
      activate:
        on-profile: dev # important
    datasource:
      url: jdbc:postgresql://PROD_DB_HOST:PORT/DB_NAME  # turn to your database
      username: PROD_USERNAME  # database username
      password: PROD_PASSWORD  # database password
    mail:
      host: 
      username: xxx@xxx.com
      password: abcdefghijklmnopqrstuvwxyz
      protocol: smtp
      properties:
        mail.smtp.auth: true
        mail.smtp.ssl.enable: true
        mail.smtp.connectiontimeout: 5000
        mail.smtp.timeout: 3000
        mail.smtp.writetimeout: 5000
    data:
      redis:
        host: localhost
        password:
        database: 0
  oss:
    endpoint:  # console address
    access-key: # access-key
    secret-key: # secret-key
    bucket: # bucket
    
  ```

## Initialize Database

[![PostgreSQL](https://img.shields.io/badge/Execute_SQL-01--init.sql-336791?logo=postgresql)](https://thalitera-postgres/init/01-init.sql)

Let's assume you've already installed PostgreSQL, and Redis.

And Sql was in `thalitera-postgres/init/01-init.sql`

## Development Workflow 🔧 

### Recommended Tools 🛠️ 

[![IntelliJ](https://img.shields.io/badge/IDE-IntelliJ_IDEA-000000?logo=intellij-idea)](https://www.jetbrains.com/idea/)
[![Postman](https://img.shields.io/badge/API_Testing-Postman-FF6C37?logo=postman)](https://www.postman.com/)
[![RedisInsight](https://img.shields.io/badge/Redis_Client-RedisInsight-DC382D?logo=redis)](https://redis.com/redis-enterprise/redis-insight/)

### Dependency Management 📦 

```bash
mvn clean install -DskipTests
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Pro Tips 💡

### Essential Plugins 🧩 

| Plugin                                                       | Benefit                        |
| :----------------------------------------------------------- | :----------------------------- |
| [![Spring Assistant](https://img.shields.io/badge/Spring_Assistant-6DB33F?logo=spring)](https://plugins.jetbrains.com/plugin/10229-spring-assistant) | Enhanced Spring Boot support   |
| [![Lombok](https://img.shields.io/badge/Lombok_Plugin-pink?logo=lombok)](https://projectlombok.org/) | Auto-generate boilerplate code |
| [![SonarLint](https://img.shields.io/badge/SonarLint-CB3032?logo=sonarlint)](https://www.sonarlint.org/) | Real-time code quality checks  |

# Frontend Development Guide🌟 

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

A modern meeting room reservation interface built with Next.js App Router and modern web standards.

## 🚀 Quick Start

### Clone Repository
```bash
git clone https://github.com/Escapsule/Thalitera
cd thalitera-frontend
```

### Install Dependencies

[![PNPM](https://img.shields.io/badge/Recommanded-PNPM-F69220?logo=pnpm)](https://pnpm.io/)

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser.

### Key Optimizations

- ✅ Code splitting with dynamic imports
- ✅ Image optimization via `next/image`
- ✅ Static page generation (ISR)
- ✅ Bundle analysis with `@next/bundle-analyzer`

# Contribution Guide 🤝

## Branch Strategy

```mermaid
gitGraph
  commit
  branch feature/awesome-feature
  checkout feature/awesome-feature
  commit
  commit
  checkout main
  merge feature/awesome-feature
```

##  License Compliance

[![GPLv3](https://img.shields.io/badge/License-GPLv3-blue?logo=gnu)](https://license/)

- All contributions must adhere to GPLv3
- Document third-party dependencies
- Include license headers in new files
