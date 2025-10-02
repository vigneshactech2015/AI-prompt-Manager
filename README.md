# AI Prompt Manager

AI Prompt Manager is a comprehensive web application designed to help users organize, manage, and track their AI prompts efficiently. The platform allows users to create, edit, and categorize prompts for different AI tools like ChatGPT, Claude, and Gemini. With built-in analytics, users can monitor prompt performance through view counts, copy statistics, and favorite tracking. The application features user authentication, CRUD operations for prompts, and detailed reporting dashboards. It's built as a microservices architecture to ensure scalability and maintainability for prompt management workflows.

## Getting Started

Run the following command at the root directory to start the application:

```bash
docker-compose up --build
```

Once the containers are up and running, access the application in your browser:

```
http://localhost:5173
```

## Architecture

![Architecture Diagram](ArchitectureDiagram.png)

## Technology Stack

- **Frontend**: Svelte
- **Backend**: Node.js
- **Database**: MongoDB

## Microservices Architecture

The application consists of three main services running in individual containers:

- **Auth Service**: Handles user authentication and authorization
- **Prompt Service**: Manages prompt CRUD operations
- **Analytics Service**: Provides analytics and reporting features

All containers are orchestrated using Docker Compose to create a unified application.
