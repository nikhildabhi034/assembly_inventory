# Assembly Parts Inventory Management System

A TypeScript-based REST API for managing assembly parts inventory. This system allows tracking of both raw parts and assembled parts, managing their quantities, and handling component relationships.

## Features

- Create and manage both raw and assembled parts
- Track inventory quantities
- Handle component relationships for assembled parts
- Prevent circular dependencies in assemblies
- Validate inventory operations
- Swagger API documentation

## Tech Stack

- Node.js
- TypeScript
- TypeORM for database management
- Express.js for API routing
- Joi for request validation
- PostgreSQL as database
- Swagger for API documentation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd assembly_inventory
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=assembly_inventory
```

4. Run database migrations:
```bash
npm run typeorm migration:run
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available via Swagger UI at `/api-docs` when the server is running.

### Main Endpoints

- `GET /api/parts` - List all parts
- `POST /api/parts` - Create a new part
- `GET /api/parts/{id}` - Get a specific part
- `POST /api/parts/{id}` - Update part inventory

## Data Models

### Part Types
- `RAW` - Basic parts that don't have components
- `ASSEMBLED` - Parts that are made up of other parts

### Part Structure
```typescript
{
  id: string;
  name: string;
  type: PartType;
  description?: string;
  quantityInStock: number;
  parts?: {
    id: string;
    name: string;
    quantity: number;
  }[];
}
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 