# AWS EC2 CI/CD Pipeline 

Automated testing, controlled Production deployments, Disaster Recovery (DR) deployment, health checks, release versioning, and rollback for a Node.js application running on AWS EC2.

## Overview

This project demonstrates how to replace manual application deployment with a controlled CI/CD pipeline using GitHub Actions, AWS EC2, Node.js, Linux, Nginx, and systemd.

In a traditional deployment process, developers push code to GitHub, and an administrator manually updates the Production and Disaster Recovery servers. This approach can introduce configuration drift, inconsistent application versions, human error, and downtime when a release fails.

This project automates the deployment process while introducing approval gates and health checks to reduce deployment risk.

## Objectives

- Automate application testing before deployment.
- Require approval before Production deployment.
- Deploy the application to AWS EC2 over SSH.
- Manage the Node.js application with systemd.
- Use Nginx as a reverse proxy.
- Validate application health after deployment.
- Deploy the same application version to a separate DR environment.
- Create release tags after successful deployments, once automatic tagging is configured and verified.
- Make recovery to a known-good application version easier.

## Architecture

```text
                 Developer
                     |
                     v
               GitHub Repository
                     |
                     v
              GitHub Actions
                     |
                     v
              Automated Tests
                     |
                     v
          Production Approval Gate
                     |
                     v
           Production EC2 Server
           Node.js + systemd
                 + Nginx
                     |
                     v
             Health Validation
                     |
                     v
             DR Deployment
                     |
                     v
                 DR EC2
           Node.js + systemd
                 + Nginx
                     |
                     v
             DR Health Check
                     |
                     v
          Release Tag / Version
```

The workflow should deploy the same tested commit to both environments. Production and DR should not independently pull whatever happens to be the latest version of the `main` branch.

## Technology Stack

| Technology | Purpose |
|---|---|
| AWS EC2 | Hosts the application in Production and DR |
| Ubuntu Linux | Server operating system |
| Node.js | Application runtime |
| Express.js | Web application framework |
| Nginx | Reverse proxy and HTTP entry point |
| systemd | Application process management |
| Git and GitHub | Source control and collaboration |
| GitHub Actions | CI/CD automation |
| SSH | Secure remote deployment |
| Git tags | Release identification and rollback references |

## CI/CD Workflow

### 1. Automated testing

The pipeline runs application tests before permitting a release to continue.

If the tests fail, the workflow must stop before deploying that release.

### 2. Production approval

A GitHub Environment approval gate protects Production deployment.

The designated reviewer must approve the deployment before the Production job proceeds. Configure this through the repository's **Settings → Environments** section.

### 3. Production deployment

The workflow connects to the Production EC2 instance over SSH and deploys the intended commit.

The deployment should:

1. Retrieve the exact commit selected by the workflow.
2. Install production dependencies.
3. Restart the application service.
4. Check that the service is running.
5. Run an application health check.

### 4. Disaster Recovery deployment

After Production passes its required validation, the pipeline deploys the same commit to the DR server.

The DR environment is then checked independently.

**Important:** A separate EC2 instance is not automatically a complete disaster recovery solution. Real DR also requires appropriate data recovery, infrastructure recovery, network access, monitoring, and a documented recovery procedure.

### 5. Automatic release tagging

The intended release process creates a version tag, for example `v1.0.1`, after all required deployment and health-check stages succeed.

The tag must point to the exact commit deployed, not an unrelated newer commit on `main`.

The tagging job requires appropriate GitHub repository permissions, normally `contents: write`, and must avoid duplicate version tags. Confirm that this job is implemented and passing before describing automatic tagging as a completed feature.

### 6. Rollback

If a deployment introduces a problem, the recovery procedure should redeploy a known-good release.

A robust rollback process should:

- Identify the last known-good release.
- Retrieve its exact commit or immutable artifact.
- Deploy that version to the affected environment.
- Restart the application safely.
- Run health checks after rollback.
- Record the result.

A Git tag identifies a version, but it does not perform rollback by itself. The rollback workflow must explicitly check out and deploy the selected version.

---

# Server Setup Guide

The following steps describe a fresh Ubuntu EC2 setup for both Production and DR. Repeat the server preparation on each instance, using separate hostnames and appropriate security rules.

## 1. Create the EC2 instances

Create two Ubuntu EC2 instances:

- `company-production`
- `company-dr`

For a learning project, a small instance may be sufficient depending on the application's resource requirements.

Recommended initial configuration:

- Ubuntu Server LTS.
- SSH access restricted to trusted administrator IP addresses.
- HTTP/HTTPS access through Nginx as required.
- TCP port `3000` not publicly accessible.
- Separate Production and DR server credentials and access controls.

Do not expose SSH to the entire internet unless there is a specific, controlled reason to do so. Restrict the EC2 security group's inbound rules.

## 2. Connect to each server

From your local machine, connect using the private key associated with the instance:

```bash
chmod 400 company-key.pem

ssh -i company-key.pem ubuntu@PRODUCTION_PUBLIC_IP
```

For the DR server, use its address:

```bash
ssh -i company-key.pem ubuntu@DR_PUBLIC_IP
```

Replace the example addresses with the public IP or DNS name of the correct instance.

## 3. Install system packages

Run on both servers:

```bash
sudo apt update
sudo apt upgrade -y

sudo apt install -y \
  nginx \
  git \
  curl \
  ca-certificates
```

Verify Nginx:

```bash
sudo systemctl enable --now nginx
sudo systemctl status nginx --no-pager
```

## 4. Install Node.js

Install a Node.js version supported by your application's `package.json` and dependencies. For example, using NodeSource for Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x \
  -o /tmp/nodesource_setup.sh

sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs

node --version
npm --version
```

Node.js 20 is shown as an example. Check your application's required version and choose a supported release accordingly. Avoid upgrading the runtime independently on Production without testing compatibility first.

## 5. Create a deployment user

Use a dedicated account for application deployment instead of running the application as `root`.

```bash
sudo adduser --disabled-password --gecos "" deploy
```

Create the application directory:

```bash
sudo mkdir -p \
  /var/www/company-cicd-app/company-pipline

sudo chown -R deploy:deploy \
  /var/www/company-cicd-app
```

The directory name `company-pipline` follows the existing project path. Keep it consistent with the path configured in the workflow and service.

## 6. Clone the application repository

As the deployment user, clone the repository into the application directory.

For a public repository:

```bash
sudo -u deploy git clone \
  https://github.com/OWNER/REPOSITORY.git \
  /var/www/company-cicd-app/company-pipline
```

Replace `OWNER/REPOSITORY` with the real GitHub repository.

For a private repository, configure a suitable authentication method. Do not embed personal access tokens directly in the repository URL or source code.

Verify the checkout:

```bash
sudo -u deploy git \
  -C /var/www/company-cicd-app/company-pipline \
  status
```

The deployment workflow should subsequently manage which commit is checked out. Avoid independently pulling arbitrary changes on either server, because that can cause Production and DR to diverge.

## 7. Install application dependencies

```bash
cd /var/www/company-cicd-app/company-pipline

sudo -u deploy npm ci
```

`npm ci` requires a valid lockfile, such as `package-lock.json`, consistent with `package.json`.

Confirm the application's startup command in `package.json`. For example:

```json
{
  "scripts": {
    "start": "node app.js",
    "test": "node --test"
  }
}
```

Use the actual scripts and test framework in your project. Do not add a test command that passes without testing meaningful application behavior.

The application must listen on the configured port. If `PORT=3000`, the Express application should bind to port `3000` and expose the required endpoints.

Expected endpoints:

- `/` - application homepage
- `/health` - health status
- `/version` - application version and, if configured, commit information

Example health response:

```json
{
  "status": "healthy"
}
```

## 8. Configure systemd

Create the service file:

```bash
sudo nano /etc/systemd/system/company-app.service
```

Example configuration:

```ini
[Unit]
Description=Company Node.js Application
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/company-cicd-app/company-pipline
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Save the file, then enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now company-app
sudo systemctl status company-app --no-pager -l
```

Check the logs if the service fails:

```bash
sudo journalctl -u company-app -n 100 --no-pager
```

Follow the logs in real time:

```bash
sudo journalctl -u company-app -f
```

A service that appears active is not sufficient proof that the application is responding. Test the HTTP endpoint as well.

## 9. Configure Nginx

Create an Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/company-app
```

Example configuration:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and validate the configuration:

```bash
sudo ln -s \
  /etc/nginx/sites-available/company-app \
  /etc/nginx/sites-enabled/company-app

sudo nginx -t
sudo systemctl reload nginx
```

If the default Nginx site conflicts with this configuration, disable it only after confirming that it is not serving another application:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

The configuration above is suitable as an initial HTTP setup. For a real public deployment, configure a domain name and HTTPS certificate before sending sensitive traffic.

## 10. Validate the application

Run these commands on each server:

```bash
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1/health
curl -i http://127.0.0.1:3000/version
```

Expected results:

- The health endpoint returns HTTP `200`.
- The version endpoint returns the expected release information.
- Nginx forwards HTTP requests to the Node.js application.
- The service remains running after a restart.

Test a restart:

```bash
sudo systemctl restart company-app

sleep 2

curl -f http://127.0.0.1/health
```

Repeat the checks on the DR instance. Use the actual application endpoints configured in your code.

---

# GitHub Actions Configuration

## 1. Configure GitHub repository secrets

Open your repository and navigate to **Settings → Secrets and variables → Actions**.

Configure the secrets used by your existing workflow:

| Secret | Purpose |
|---|---|
| `EC2_HOST` | Production EC2 public IP or DNS name |
| `EC2_USER` | SSH deployment username for Production |
| `EC2_SSH_KEY` | Private key used by the deployment workflow |
| `DR_EC2_HOST` | DR EC2 public IP or DNS name |
| `DR_EC2_USER` | SSH deployment username for DR |

Use the names expected by your actual YAML. If the workflow uses a separate DR key, configure a separate secret for it.

Never commit private SSH keys, passwords, tokens, or production environment files to Git.

## 2. Configure SSH access

The workflow runner must be able to connect to the EC2 servers.

- Install the matching public key in the appropriate deployment account's `authorized_keys`.
- Store the private key in GitHub Actions secrets.
- Restrict the deployment account's permissions.
- Validate SSH host keys rather than blindly trusting unknown hosts.
- Restrict SSH ingress wherever practical.

Do not give the deployment user unrestricted `sudo` access just to make the workflow easier. If service restarts require elevated permissions, grant only the specific commands needed.

## 3. Configure the Production approval gate

In GitHub, open **Settings → Environments** and create or configure the `production` environment.

Set the required reviewers and any applicable protection rules. The deployment job must reference the correct environment in the YAML, for example:

```yaml
environment: production
```

A reviewer requirement only applies if the repository plan and environment configuration support it and the workflow job actually uses that environment.

## 4. Expected workflow stages

The intended deployment sequence is:

1. Run automated tests.
2. Wait for Production approval.
3. Deploy the exact tested commit to Production.
4. Validate Production health.
5. Deploy that same commit to DR.
6. Validate DR health.
7. Create the release tag, if the automatic tagging job is configured.

A failure in a required stage should prevent later release stages from running. Verify the actual `needs` dependencies and job conditions in `.github/workflows/deployment.yml`.

## 5. Release tagging and rollback

A release tag such as `v1.0.1` gives a human-readable reference to a specific commit.

For release tagging to work reliably:

- Fetch existing Git tags before selecting the next version.
- Ensure the new tag does not already exist.
- Tag the exact deployed commit.
- Give the tagging job the necessary GitHub permissions.
- Prevent concurrent releases from selecting the same next version.
- Run the tagging job only after the required deployment and health-check jobs succeed.

For rollback, select a known-good release and redeploy the exact corresponding commit or immutable build artifact. Then restart the service and verify health.

**Do not overwrite an existing release tag to point to a different commit.** Release tags should remain stable references.

---

# Troubleshooting

### Application is not responding

```bash
sudo systemctl status company-app --no-pager -l
sudo journalctl -u company-app -n 100 --no-pager
curl -i http://127.0.0.1:3000/health
```

Check that the application is listening on the expected port and that its startup command matches `package.json`.

### Nginx returns 502 Bad Gateway

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo tail -n 100 /var/log/nginx/error.log
curl -i http://127.0.0.1:3000/health
```

A 502 commonly means Nginx cannot reach the application, often because Node.js has stopped or is listening on another port.

### Git reports dubious ownership

Check the owner and repository location:

```bash
ls -ld /var/www/company-cicd-app/company-pipline
```

Ensure the deployment user owns the working tree where appropriate. If Git's ownership protection is involved, add only the intended repository path to the relevant user's Git safe-directory configuration.

### Production and DR have different versions

Check the deployed commit on both servers:

```bash
git -C /var/www/company-cicd-app/company-pipline rev-parse HEAD
```

Compare the full commit hashes. The pipeline should explicitly deploy the same intended commit to both environments.

### Release tag was not created

Check whether every required deployment job succeeded, whether the tagging job ran, whether `contents: write` permission is available, and whether the intended tag already exists.

---

# Security and Reliability Considerations

- Do not expose the Node.js application port publicly when Nginx can proxy to it locally.
- Restrict SSH access and protect deployment credentials.
- Use HTTPS for public application traffic.
- Keep Production and DR configurations consistent but independently recoverable.
- Test rollback before relying on it during an incident.
- Monitor application health and system logs.
- Back up application data and databases separately.
- Avoid destructive database migrations during deployments unless a recovery strategy exists.
- Use immutable build artifacts where practical to improve repeatability.
- Consider blue-green or rolling deployment techniques to reduce downtime during releases.

## Future Improvements

- DNS configuration and HTTPS.
- AWS Application Load Balancer and health-based routing.
- Staging environment with smoke tests.
- Automated release tagging and rollback workflow.
- Stronger unit, integration, and deployment tests.
- Centralized logging and monitoring.
- Infrastructure as Code using Terraform.
- Improved DR recovery procedures and regular recovery testing.

## Key Takeaway

This project demonstrates how a CI/CD pipeline can reduce manual deployment effort while improving release consistency, deployment control, traceability, and recovery.

The goal is not simply to automate commands. It is to make deployments predictable, verify that the application works after a release, and provide a clear path back to a known-good version.

---

**Project Status:** Hands-on learning and portfolio project. Documented capabilities should be updated as the corresponding workflow steps are implemented and verified.

**Author:** Abubakar Alnour

**Focus:** Cloud Engineering · AWS · Linux · CI/CD · DevOps · Release Management