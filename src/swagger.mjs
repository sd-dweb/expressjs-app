export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Tutorial API',
    version: '1.0.0',
    description: 'Express.js Tutorial REST API',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User CRUD endpoints' },
    { name: 'Products', description: 'Product endpoints' },
    { name: 'Cart', description: 'Session cart endpoints' },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id:       { type: 'integer', example: 1 },
          name:     { type: 'string',  example: 'John Doe' },
          email:    { type: 'string',  format: 'email', example: 'john@example.com' },
          password: { type: 'string',  example: '123456' },
        },
      },
      NewUser: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 3, maxLength: 32, example: 'Jane Doe' },
          email:    { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'secret' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id:    { type: 'integer', example: 123 },
          name:  { type: 'string',  example: 'iphone' },
          price: { type: 'number',  example: 1200.00 },
        },
      },
      CartItem: {
        type: 'object',
        additionalProperties: true,
        example: { productId: 123, quantity: 2 },
      },
      LocalCredentials: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: '123456' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          msg: { type: 'string' },
        },
      },
    },
  },
  paths: {
    // ── Root ──────────────────────────────────────────────────────────────
    '/': {
      get: {
        summary: 'Health check / home',
        tags: ['Auth'],
        responses: {
          200: {
            description: 'Hello World response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { msg: { type: 'string', example: 'Hello World!' } },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    '/api/auth': {
      post: {
        summary: 'Login with username & password (local strategy)',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LocalCredentials' },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },

    '/api/auth/status': {
      get: {
        summary: 'Get current authentication status',
        tags: ['Auth'],
        responses: {
          200: {
            description: 'Authenticated – returns user object',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    authenticated: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        summary: 'Logout current session',
        tags: ['Auth'],
        responses: {
          200: { description: 'Logged out successfully' },
          400: { description: 'Logout error' },
          401: { description: 'Not authenticated' },
        },
      },
    },

    '/api/auth/google': {
      get: {
        summary: 'Initiate Google OAuth2 flow',
        tags: ['Auth'],
        responses: {
          302: { description: 'Redirects to Google consent screen' },
        },
      },
    },

    '/api/auth/google/redirect': {
      get: {
        summary: 'Google OAuth2 redirect / callback',
        tags: ['Auth'],
        responses: {
          200: { description: 'Google authentication successful' },
          401: { description: 'Authentication failed' },
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────────────────
    '/api/users': {
      get: {
        summary: 'Get all users (supports filtering)',
        tags: ['Users'],
        parameters: [
          {
            in: 'query',
            name: 'filter',
            schema: { type: 'string', minLength: 3, maxLength: 10 },
            description: 'Field to filter on (e.g. name, email)',
          },
          {
            in: 'query',
            name: 'value',
            schema: { type: 'string' },
            description: 'Value to filter by',
          },
        ],
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewUser' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: { description: 'Validation errors' },
        },
      },
    },

    '/api/users/{id}': {
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'User ID',
        },
      ],
      get: {
        summary: 'Get a user by ID',
        tags: ['Users'],
        responses: {
          200: {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
      put: {
        summary: 'Replace a user (full update)',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewUser' },
            },
          },
        },
        responses: {
          200: {
            description: 'User replaced',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
      patch: {
        summary: 'Partially update a user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string' },
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
      delete: {
        summary: 'Delete a user',
        tags: ['Users'],
        responses: {
          200: {
            description: 'User deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { msg: { type: 'string', example: 'User deleted successfully!' } },
                },
              },
            },
          },
          404: { description: 'User not found' },
        },
      },
    },

    // ── Products ──────────────────────────────────────────────────────────
    '/api/products': {
      get: {
        summary: 'Get all products (requires signed cookie)',
        tags: ['Products'],
        responses: {
          200: {
            description: 'List of products',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              },
            },
          },
          403: {
            description: 'Missing or invalid cookie',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // ── Cart ──────────────────────────────────────────────────────────────
    '/api/cart': {
      get: {
        summary: 'Get session cart items',
        tags: ['Cart'],
        responses: {
          200: {
            description: 'Cart items',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        summary: 'Add an item to the session cart',
        tags: ['Cart'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartItem' },
            },
          },
        },
        responses: {
          201: {
            description: 'Item added to cart',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CartItem' },
              },
            },
          },
          401: { description: 'Not authenticated' },
        },
      },
    },
  },
};

