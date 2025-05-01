# ClassroomLM

An open-source platform that enables students and teachers to interact with classroom materials through Retrieval-Augmented Generation (RAG). Upload documents, chat with course content, and streamline academic Q&A using powerful language models—all in one collaborative interface.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Vitest with React Testing Library
- **Database**: Supabase
- **Deployment**: Docker and Kubernetes support

## Features

- **Classroom-Style Structure**  
  Teachers can create classrooms, upload documents (PDFs, slides, handwritten notes), and invite students.

- **Classroom-Specific AI Assistants**  
  Each classroom has its own RAG-based LLM assistant trained on uploaded materials.

- **Collaborative AI Chats**  
  Group chat support where the AI can participate with full chat context.


## Prerequisites

- Node.js (LTS version)
- pnpm (recommended package manager)
- Docker (for containerized development)
- Kubernetes (for deployment)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/TechAtNYU/dev-team-spring-25.git
   cd dev-team-spring-25
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the necessary environment variables.
   ```bash
   cp .env.example .env
   ```
   and update the appropriate variables
4. Start the development server:
   ```bash
   pnpm dev
   ```
   The application will be available at [http://localhost:8080](http://localhost:8080)

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI
- `pnpm coverage` - Generate test coverage report
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Development

- The project uses the Next.js App Router for routing
- Components are styled using Tailwind CSS with shadcn/ui
- TypeScript ensures type safety throughout the application
- Git hooks (via Husky) ensure code quality before commits
- Prettier and ESLint maintain consistent code style

## Testing

The project uses Vitest for testing with React Testing Library. Tests can be run in watch mode or as a single run. Coverage reports can be generated to ensure comprehensive testing.

## Deployment

The application can be deployed using Docker and Kubernetes. The project includes:
- Dockerfile for containerization
- Kubernetes manifests in the `k8s` directory
- Tekton pipelines for CI/CD

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request
