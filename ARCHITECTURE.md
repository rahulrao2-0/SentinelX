# 🛡️ SentinelX — Complete System Architecture & Pipeline Diagrams

This document contains visual diagrams and detailed workflow mappings for the entire **SentinelX** platform.

---

## 📌 Table of Contents
1. [Master System Architecture](#1-master-system-architecture)
2. [Pipeline 1: Log Ingestion & Multi-Tenant Stamping](#2-pipeline-1-log-ingestion--multi-tenant-stamping)
3. [Pipeline 2: Live Log Streaming](#3-pipeline-2-live-log-streaming)
4. [Pipeline 3: Alert & Incident Detection](#4-pipeline-3-alert--incident-detection)
5. [Pipeline 4: Search & Trace Correlation](#5-pipeline-4-search--trace-correlation)
6. [Technology Responsibility Matrix](#6-technology-responsibility-matrix)
7. [Codebase File Mapping](#7-codebase-file-mapping)

---

## 1. Master System Architecture

This flowchart illustrates the end-to-end data flow from client microservices to storage, processing, real-time push, and frontend dashboards:

```mermaid
flowchart TD
    subgraph ClientApps["1. Client Applications (Websites / Microservices)"]
        AppA["Microservice: Payment Service"]
        AppB["Microservice: Auth Service"]
        SDK["SentinelX SDK (npm package)\n- Buffers logs for 1 second\n- Captures unhandled exceptions\n- Stamped with serviceName & traceId"]
        AppA --> SDK
        AppB --> SDK
    end

    subgraph IngestionLayer["2. API Gateway & Ingestion Server (Node.js / Express)"]
        IngestEndpoint["POST /api/logs/ingest\nHeader: x-api-key"]
        AuthMiddleware["API Key Validator & Tenant Stamper\n- Validates x-api-key against MySQL\n- Injects projectId & receivedAt"]
        AuthRoutes["Auth Controller\n- /api/auth/signup (Admin)\n- /api/auth/login\n- /api/auth/join (Engineer)"]
        AlertsRoutes["Alert Rules API\n- GET /api/alerts\n- POST /api/alerts"]
        SearchRoutes["Search API\n- GET /api/logs/search?q=..."]

        SDK -- "Batch HTTP POST every 1s" --> IngestEndpoint
        IngestEndpoint --> AuthMiddleware
    end

    subgraph StorageLayer["3. Databases & State Engines"]
        MySQL[("MySQL Relational DB\n- projects\n- users\n- alert_rules\n- incidents")]
        ES[("Elasticsearch Engine\nIndex: sentinelx-logs\n- Full-text search\n- AI Natural Language queries\n- Trace correlation")]
        RedisStore[("Redis Fast Memory\n- Sliding window counters (INCR)\n- Distributed locks (SET NX EX)\n- Anomaly rolling baselines\n- Rate limits & Sessions")]
    end

    AuthMiddleware -- "Verify API Key" --> MySQL
    AuthRoutes <--> MySQL
    AlertsRoutes <--> MySQL
    SearchRoutes <--> ES

    subgraph KafkaPipeline["4. Durable Message Pipeline (Apache Kafka)"]
        Producer["Kafka Producer"]
        KafkaTopic["Kafka Topic: logs-raw\n- 7-day disk persistence\n- Decouples ingestion from consumers"]

        AuthMiddleware -- "Enriched Logs Batch" --> Producer
        Producer --> KafkaTopic
    end

    subgraph ConsumerLayer["5. Asynchronous Kafka Consumers"]
        ESWriter["Consumer 1: ES Writer\n(Group: es-writer-group)\n- Reads ALL logs"]
        AlertChecker["Consumer 2: Alert Checker\n(Group: alert-checker-group)\n- Reads: error & warn logs"]
        AnomalyDetector["Consumer 3: Anomaly Detector\n(Group: anomaly-detector-group)\n- Reads: error ratio vs baseline"]

        KafkaTopic --> ESWriter
        KafkaTopic --> AlertChecker
        KafkaTopic --> AnomalyDetector
    end

    ESWriter -- "Bulk Index Logs" --> ES
    AlertChecker -- "INCR error count" --> RedisStore
    AlertChecker -- "Threshold Breached -> Insert Incident" --> MySQL
    AnomalyDetector -- "Compute dynamic baseline" --> RedisStore
    AnomalyDetector -- "Spike Detected -> Insert Incident" --> MySQL

    subgraph RealtimeIntercom["6. Real-Time Intercom (Redis Pub/Sub & WebSockets)"]
        RedisPubSub["Redis Pub/Sub Channels\n- logs:live:{projectId}\n- alerts:{projectId}\n- debug:room:{roomId}"]
        SocketIOServer["Socket.IO Server\n- Room: live_logs_{projectId}\n- Room: debug_{roomId}"]

        ESWriter -- "PUBLISH logs:live:{projectId}" --> RedisPubSub
        AlertChecker -- "PUBLISH alerts:{projectId}" --> RedisPubSub
        AnomalyDetector -- "PUBLISH alerts:{projectId}" --> RedisPubSub

        RedisPubSub -- "sub.on('message')" --> SocketIOServer
    end

    subgraph FrontendApp["7. Frontend UI (React + Vite + MUI)"]
        DashboardUI["Dashboard.jsx\n- Real-time stat cards\n- Active incident table\n- Live alert banners"]
        LiveStreamUI["DebugRoom.jsx\n- Live log stream (terminal)\n- Multi-engineer chat\n- Pin findings & AI suggestions"]
        SearchUI["SearchLogs.jsx\n- Natural language search\n- Trace chain viewer"]
        AlertsUI["Alerts.jsx\n- Alert rules management"]

        SocketIOServer -- "socket.emit('new_log')" --> LiveStreamUI
        SocketIOServer -- "socket.emit('new_alert')" --> DashboardUI
        SearchUI <--> SearchRoutes
        AlertsUI <--> AlertsRoutes
    end
```

---

## 2. Pipeline 1: Log Ingestion & Multi-Tenant Stamping

How an application log is produced, buffered, authenticated, and delivered safely to Kafka:

```mermaid
sequenceDiagram
    autonumber
    actor DevApp as Client App (e.g. Payment)
    participant SDK as SentinelX SDK
    participant API as Express API (/api/logs/ingest)
    participant DB as MySQL (projects table)
    participant Kafka as Kafka Topic: logs-raw

    DevApp->>SDK: sentinelx.log('error', 'DB connection failed', { pool: 0 })
    Note over SDK: Buffers log in memory (1 second window)
    SDK->>API: HTTP POST /api/logs/ingest (Header: x-api-key)
    API->>DB: Look up project where api_key = x-api-key
    DB-->>API: Returns project { id: "proj_101", name: "Local Mart" }
    Note over API: Stamping:<br/>log.projectId = "proj_101"<br/>log.receivedAt = 2026-10-13T...
    API->>Kafka: producer.send({ topic: 'logs-raw', messages: [...] })
    Kafka-->>API: ACK (written to disk)
    API-->>SDK: 200 OK { success: true }
    Note over SDK: Clears in-memory buffer
```

---

## 3. Pipeline 2: Live Log Streaming

How logs flow in real time from Kafka to Elasticsearch and the browser's debug screen:

```mermaid
sequenceDiagram
    autonumber
    participant Kafka as Kafka Topic: logs-raw
    participant ESWriter as Consumer: ES Writer
    participant ES as Elasticsearch (sentinelx-logs)
    participant RedisPS as Redis Pub/Sub (logs:live:proj_101)
    participant SIO as Socket.IO Server
    actor Browser as Frontend (DebugRoom.jsx)

    Kafka->>ESWriter: Pulls batch of raw logs
    par Persistent Storage
        ESWriter->>ES: Bulk index logs (for search & analytics)
    and Real-Time Fanout
        ESWriter->>RedisPS: PUBLISH "logs:live:proj_101" (log payload)
        RedisPS->>SIO: sub.on('message') receives log
        SIO->>Browser: io.to('live_logs_proj_101').emit('new_log', log)
        Note over Browser: Log rendered instantly on live terminal canvas
    end
```

---

## 4. Pipeline 3: Alert & Incident Detection

How error spikes are caught, counted, stored as incidents, and pushed as alerts:

```mermaid
sequenceDiagram
    autonumber
    participant Kafka as Kafka Topic: logs-raw
    participant AlertChecker as Consumer: Alert Checker
    participant Redis as Redis (Counters & Locks)
    participant DB as MySQL (alert_rules & incidents)
    participant RedisPS as Redis Pub/Sub (alerts:proj_101)
    participant SIO as Socket.IO Server
    actor Browser as Frontend (Dashboard.jsx)

    Kafka->>AlertChecker: Pulls log where level == 'error'
    AlertChecker->>Redis: INCR error_count:proj_101:payment-service:window_1m
    Redis-->>AlertChecker: Current count = 6
    AlertChecker->>DB: Check rules (threshold = 5 errors / 1 min)
    Note over AlertChecker: ⚠️ Threshold breached!
    AlertChecker->>Redis: SET lock:alert:rule_101 NX EX 60 (Prevent duplicate spam)
    alt Lock Acquired (First time triggering)
        AlertChecker->>DB: INSERT INTO incidents (id, project_id, rule_id, status='active')
        AlertChecker->>RedisPS: PUBLISH "alerts:proj_101" (Incident details)
        RedisPS->>SIO: Received alert notification
        SIO->>Browser: io.to('live_logs_proj_101').emit('new_alert', incident)
        Note over Browser: 🚨 Red banner pops up + Active Incident counter increments!
    else Lock Exists
        Note over AlertChecker: Alert already active, suppress repeat notification
    end
```

---

## 5. Pipeline 4: Search & Trace Correlation

How natural language search and distributed trace inspection work:

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as Engineer
    participant Frontend as SearchLogs.jsx
    participant API as GET /api/logs/search?q=...
    participant RedisCache as Redis Search Cache
    participant ES as Elasticsearch Cluster

    Engineer->>Frontend: Types: "payment errors last hour"
    Frontend->>API: GET /api/logs/search?q=payment+errors&time=1h
    API->>RedisCache: Check cached query result
    alt Cache Hit
        RedisCache-->>API: Returns cached JSON
    else Cache Miss
        Note over API: Translates query into ES Query DSL<br/>Enforces multi-tenancy filter:<br/>{ filter: { term: { projectId: user.projectId } } }
        API->>ES: Run search query + aggregations
        ES-->>API: Returns matching log documents
        API->>RedisCache: SETEX search:cache:key 30s
    end
    API-->>Frontend: JSON results array
    Frontend-->>Engineer: Displays logs table with highlighted terms & clickable traceId
    Engineer->>Frontend: Clicks traceId (e.g. "trace-8f7a1")
    Frontend->>API: GET /api/logs/trace/trace-8f7a1
    API->>ES: Query all logs where traceId = "trace-8f7a1" ORDER BY timestamp ASC
    ES-->>API: Full sequence: Gateway -> Auth -> Order -> Payment
    API-->>Frontend: Returns microservice call chain with root cause highlighted!
```

---

## 6. Technology Responsibility Matrix

| Technology | Primary Role in SentinelX | Why It Was Chosen |
| :--- | :--- | :--- |
| **SentinelX SDK** | Log Capture & Buffering | Buffers logs for 1 second to avoid spamming HTTP requests; captures uncaught exceptions automatically. |
| **Node.js / Express** | API Gateway & Ingestion | Event-driven, low latency, handles high-throughput log ingestion and serves REST endpoints. |
| **Apache Kafka** | Shock Absorber & Queue | Stores logs on disk for 7 days; fan-outs the exact same log stream to 3 independent consumer groups. |
| **Elasticsearch** | Search & Analytics Engine | Fast full-text search, fuzzy matching, date histogram aggregations, trace correlation. |
| **MySQL** | Relational Business Data | ACID compliance for Projects, Users, Alert Rules, and Incident records. |
| **Redis** | High-Speed Cache & Intercom | Fast atomic counters (`INCR`), sliding-window rate limiting, distributed locks (`SET NX EX`), and Pub/Sub backend notifications. |
| **Socket.IO** | Server-to-Browser Push | Delivers real-time logs, emergency alerts, and debug room chat directly to the React frontend. |
| **React + MUI** | Engineer Operations UI | Dark-mode interface for monitoring live streams, managing alert rules, searching logs, and collaborating in debug rooms. |

---

## 7. Codebase File Mapping

```
SentinelX/
├── ARCHITECTURE.md                  # <-- You are here (System Architecture & Diagrams)
├── architecture_diagram.html        # <-- Double-clickable interactive HTML visualizer
├── Backend/
│   ├── app.js                       # Express setup, Socket.io, background service init
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MySQL pool connection
│   │   ├── controllers/
│   │   │   └── auth.js              # SignupProjectAdministrator, LoginUser, JoinProject
│   │   ├── kafka/
│   │   │   ├── config.js            # Kafka client setup (brokers)
│   │   │   ├── producer.js          # sendLogToKafka (logs-raw)
│   │   │   └── consumer.js          # Kafka consumer (live stream)
│   │   └── routes/
│   │       ├── auth.js              # Authentication endpoints
│   │       └── logs.js              # /api/logs/ingest
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Stats & active incidents
│   │   │   ├── SearchLogs.jsx       # Log query & trace viewing
│   │   │   ├── Alerts.jsx           # Alert rule management
│   │   │   ├── DebugRoom.jsx        # Real-time log stream & team chat
│   │   │   └── Login.jsx            # Sign in / Admin signup / Engineer join
│   │   └── context/
│   │       └── AuthContext.jsx      # User session management
└── SentinelX-sdk/
    └── index.js                     # Client SDK (sentinelx.init & sentinelx.log)
```
