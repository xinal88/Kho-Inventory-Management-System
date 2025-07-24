# Contributing to Inventory Management Dashboard

Thank you for your interest in contributing to the Inventory Management Dashboard! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 16 or higher
- MongoDB 4.4 or higher
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/inventory-management-dashboard.git
cd inventory-management-dashboard
```

2. **Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit the files with your local configuration
```

4. **Database Setup**
```bash
# Start MongoDB
mongod

# Create admin user and seed data
cd backend
npm run create-admin
npm run seed
cd ..
```

5. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm start
```

## Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows these standards:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Commit Messages

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example:
```
feat: add inventory low stock alerts
fix: resolve authentication token expiry issue
docs: update API documentation
```

### Branch Naming

Use descriptive branch names:
- `feature/inventory-alerts`
- `bugfix/auth-token-expiry`
- `docs/api-documentation`

## Project Structure

```
inventory-management-dashboard/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Utility scripts
│   └── tests/             # Backend tests
├── public/                # Static assets
└── docs/                  # Documentation
```

## Contributing Process

### 1. Create an Issue

Before starting work, create an issue describing:
- The problem or feature request
- Proposed solution
- Any relevant context

### 2. Fork and Branch

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/inventory-management-dashboard.git

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write clean, well-documented code
- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Test the application manually
npm start
```

### 5. Submit a Pull Request

1. Push your changes to your fork
2. Create a pull request on GitHub
3. Provide a clear description of changes
4. Link to related issues
5. Wait for review and address feedback

## Testing

### Frontend Testing
- Use Jest and React Testing Library
- Write unit tests for components
- Test user interactions
- Mock API calls

### Backend Testing
- Use Jest and Supertest
- Test API endpoints
- Test database operations
- Mock external services

### Example Test Structure
```javascript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test implementation
  });

  afterEach(() => {
    // Cleanup
  });
});
```

## API Development

### Adding New Endpoints

1. **Create Route Handler**
```javascript
// backend/routes/newFeature.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  // Implementation
});

module.exports = router;
```

2. **Add to Server**
```javascript
// backend/server.js
app.use('/api/new-feature', require('./routes/newFeature'));
```

3. **Update Frontend Service**
```javascript
// src/services/api.js
export const newFeatureAPI = {
  getAll: () => api.get('/new-feature'),
  // Other methods
};
```

### Database Models

When creating new models:
- Use proper validation
- Add indexes for performance
- Include timestamps
- Add virtual fields when needed
- Document the schema

## UI/UX Guidelines

### Design Principles
- Consistency with existing design
- Mobile-first responsive design
- Accessibility compliance
- Clear visual hierarchy
- Intuitive user flows

### Component Development
- Use Tailwind CSS for styling
- Follow atomic design principles
- Make components reusable
- Add proper prop validation
- Include loading and error states

### Icons and Assets
- Use Lucide React for icons
- Optimize images and assets
- Follow naming conventions
- Maintain consistent sizing

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Include usage examples
- Keep README files updated

### API Documentation
- Document all endpoints
- Include request/response examples
- Specify authentication requirements
- Note any limitations or constraints

## Performance Guidelines

### Frontend
- Lazy load components when possible
- Optimize bundle size
- Use React.memo for expensive components
- Implement proper error boundaries

### Backend
- Use database indexes
- Implement caching where appropriate
- Optimize database queries
- Handle errors gracefully

## Security Considerations

- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines
- Keep dependencies updated

## Getting Help

- Check existing issues and documentation
- Ask questions in GitHub discussions
- Join our community chat (if available)
- Contact maintainers for complex issues

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to make this project better!
