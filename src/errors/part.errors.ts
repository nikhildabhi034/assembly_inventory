export class PartNotFoundError extends Error {
  constructor(message: string) {
    super(message.includes('Component parts') ? message : `Part with ID ${message} not found`);
    this.name = 'PartNotFoundError';
  }
}

export class DuplicatePartNameError extends Error {
  constructor(name: string) {
    super(`Part with name "${name}" already exists`);
    this.name = 'DuplicatePartNameError';
  }
}

export class InsufficientQuantityError extends Error {
  constructor(partName: string) {
    super(`Insufficient quantity available for part: ${partName}`);
    this.name = 'InsufficientQuantityError';
  }
}

export class CircularDependencyError extends Error {
  constructor() {
    super('Circular dependency detected in assembled parts');
    this.name = 'CircularDependencyError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
} 