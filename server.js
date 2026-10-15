
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// HOME PAGE - CLOUD ENGINEERING DASHBOARD
// ==========================================

app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Porduction  | Engineering Portal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg: #08111f;
            --panel: #101c2e;
            --border: #22334b;
            --text: #edf4ff;
            --muted: #93a4bd;
            --blue: #60a5fa;
            --cyan: #67e8f9;
            --green: #4ade80;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background:
                radial-gradient(ellipse at 15% 0%, #142b4a 0%, transparent 42%),
                radial-gradient(ellipse at 90% 90%, #102b36 0%, transparent 38%),
                var(--bg);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.6;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .container {
            width: min(1120px, 90%);
            margin: auto;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 26px 0;
            border-bottom: 1px solid rgba(147, 164, 189, 0.15);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 800;
            font-size: 18px;
            letter-spacing: -0.5px;
        }

        .brand-icon {
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 13px;
            color: #08111f;
            background: linear-gradient(135deg, var(--cyan), var(--blue));
            font-size: 21px;
        }

        .nav-status {
            display: flex;
            align-items: center;
            gap: 9px;
            color: var(--muted);
            font-size: 12px;
            border: 1px solid var(--border);
            padding: 9px 13px;
            border-radius: 30px;
            background: rgba(16, 28, 46, 0.7);
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--green);
            box-shadow: 0 0 12px rgba(74, 222, 128, 0.7);
        }

        .hero {
            padding: 85px 0 55px;
            max-width: 790px;
        }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--cyan);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 24px;
        }

        .eyebrow::before {
            content: "";
            width: 25px;
            height: 2px;
            background: var(--cyan);
        }

        h1 {
            font-size: clamp(38px, 6vw, 66px);
            line-height: 1.12;
            letter-spacing: -3px;
            margin-bottom: 24px;
        }

        h1 span {
            background: linear-gradient(90deg, var(--cyan), var(--blue));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .hero p {
            color: var(--muted);
            font-size: 16px;
            max-width: 620px;
            line-height: 1.9;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 13px;
            margin-top: 32px;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 19px;
            border-radius: 9px;
            font-weight: 600;
            font-size: 13px;
            transition: transform 0.2s, border-color 0.2s;
        }

        .button:hover {
            transform: translateY(-2px);
        }

        .primary {
            background: linear-gradient(100deg, var(--cyan), var(--blue));
            color: #08111f;
        }

        .secondary {
            border: 1px solid var(--border);
            background: rgba(16, 28, 46, 0.7);
        }

        .section-heading {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 15px;
            margin-bottom: 22px;
        }

        h2 {
            font-size: 21px;
            letter-spacing: -0.5px;
        }

        .section-subtitle {
            color: var(--muted);
            font-size: 12px;
            margin-top: 5px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
        }

        .card {
            padding: 25px;
            background: linear-gradient(
                145deg,
                rgba(20, 35, 56, 0.95),
                rgba(12, 23, 39, 0.95)
            );
            border: 1px solid var(--border);
            border-radius: 16px;
            transition: transform 0.2s, border-color 0.2s;
        }

        .card:hover {
            transform: translateY(-4px);
            border-color: #42658c;
        }

        .card-icon {
            width: 45px;
            height: 45px;
            display: grid;
            place-items: center;
            border: 1px solid #294766;
            background: #142b43;
            border-radius: 12px;
            font-size: 21px;
            margin-bottom: 20px;
        }

        .card h3 {
            font-size: 15px;
            margin-bottom: 9px;
        }

        .card p {
            color: var(--muted);
            font-size: 12px;
            line-height: 1.8;
        }

        .tag {
            display: inline-block;
            color: var(--cyan);
            background: rgba(103, 232, 249, 0.08);
            border: 1px solid rgba(103, 232, 249, 0.15);
            padding: 5px 9px;
            font-size: 10px;
            border-radius: 6px;
            margin-top: 18px;
        }

        .pipeline {
            margin-top: 70px;
            padding: 30px;
            border: 1px solid var(--border);
            border-radius: 16px;
            background: rgba(16, 28, 46, 0.65);
        }

        .pipeline-flow {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 25px;
        }

        .step {
            flex: 1;
            text-align: center;
            padding: 16px 8px;
            border: 1px solid #29415d;
            border-radius: 10px;
            background: #0b1727;
        }

        .step strong {
            display: block;
            font-size: 12px;
        }

        .step small {
            color: var(--muted);
            font-size: 10px;
        }

        .arrow {
            color: var(--cyan);
            font-size: 18px;
        }

        .footer {
            margin-top: 70px;
            padding: 25px 0;
            border-top: 1px solid rgba(147, 164, 189, 0.15);
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            color: var(--muted);
            font-size: 11px;
        }

        .footer strong {
            color: var(--text);
        }

        @media (max-width: 700px) {
            .hero {
                padding-top: 60px;
            }

            .grid {
                grid-template-columns: 1fr;
            }

            .pipeline-flow {
                flex-direction: column;
            }

            .arrow {
                transform: rotate(90deg);
            }

            .section-heading {
                align-items: start;
                flex-direction: column;
            }

            h1 {
                letter-spacing: -1.5px;
            }
        }
    </style>
</head>

<body>
    <div class="container">

        <nav>
            <a href="/" class="brand">
                <span class="brand-icon">⌘</span>
                Multi Cloud 
            </a>

            <div class="nav-status">
                <span class="dot"></span>
                APPLICATION ONLINE
            </div>
        </nav>

        <header class="hero">
            <div class="eyebrow">Cloud Engineering & DevOps</div>

            <h1>
                CI/CD Pipline<br>
                <span>Test cloud infrastructure.</span>
            </h1>

            <p>
                Welcome to my cloud engineering environment.
                This application demonstrates automated deployment,
                application monitoring, and modern infrastructure
                practices using AWS, Node.js, Nginx, and GitHub Actions.
            </p>

            <div class="actions">
                <a href="/health" class="button primary">
                    View Health Status ↗
                </a>

                <a href="/version" class="button secondary">
                    Application Version
                </a>
            </div>
        </header>

        <section>
            <div class="section-heading">
                <div>
                    <h2>Infrastructure Overview</h2>
                    <p class="section-subtitle">
                        Core technologies powering this application
                    </p>
                </div>
            </div>

            <div class="grid">
                <article class="card">
                    <div class="card-icon">☁</div>
                    <h3>Cloud Infrastructure</h3>
                    <p>
                        Application hosting on AWS EC2 with a Linux
                        environment and a service designed for reliable
                        application execution.
                    </p>
                    <span class="tag">AWS EC2</span>
                </article>

                <article class="card">
                    <div class="card-icon">⇄</div>
                    <h3>CI/CD Automation</h3>
                    <p>
                        GitHub Actions automates application validation
                        and deployment, with production approval
                        before release.
                    </p>
                    <span class="tag">GITHUB ACTIONS</span>
                </article>

                <article class="card">
                    <div class="card-icon">◈</div>
                    <h3>Application Services</h3>
                    <p>
                        Node.js and Express power the application,
                        while Nginx provides the web entry point
                        and reverse proxy.
                    </p>
                    <span class="tag">NODE.JS + NGINX</span>
                </article>
            </div>
        </section>

        <section class="pipeline">
            <h2>Deployment Workflow</h2>
            <p class="section-subtitle">
                From source code to a validated application release
            </p>

            <div class="pipeline-flow">
                <div class="step">
                    <strong>01 · CODE</strong>
                    <small>GitHub</small>
                </div>

                <span class="arrow">→</span>

                <div class="step">
                    <strong>02 · TEST</strong>
                    <small>CI pipeline</small>
                </div>

                <span class="arrow">→</span>

                <div class="step">
                    <strong>03 · APPROVE</strong>
                    <small>Production gate</small>
                </div>

                <span class="arrow">→</span>

                <div class="step">
                    <strong>04 · DEPLOY</strong>
                    <small>EC2 + health checks</small>
                </div>
            </div>
        </section>

        <footer class="footer">
            <span>© 2026 <strong>Bakry Cloud</strong></span>
            <span>Designed for eliabiliy. Delivered through automation.</span>
        </footer>

    </div>
</body>
</html>
    `);
});

// ==========================================
// HEALTH CHECK - USED BY CI/CD
// ==========================================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

// ==========================================
// APPLICATION VERSION
// ==========================================

app.get("/version", (req, res) => {
    res.status(200).json({
        version: process.env.APP_VERSION || "1.0.0",
        commit: process.env.APP_COMMIT || "unknown"
    });
});

// ==========================================
// CLOUD ENGINEER PROFILE API
// ==========================================

app.get("/cloud", (req, res) => {
    res.status(200).json({
        name: "Bakry Alnour Jarallah Mohamed",
        role: "Cloud Engineer",
        focus: [
            "Cloud Infrastructure",
            "DevOps",
            "CI/CD Automation"
        ]
    });
});

module.exports = app;