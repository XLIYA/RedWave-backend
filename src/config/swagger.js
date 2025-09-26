// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { 
      title: 'RedWave API', 
      version: '1.0.0', 
      description: 'RedWave music platform API'
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT'
        },
      },
      parameters: {
        Page: { 
          name: 'page', 
          in: 'query', 
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        PageSize: { 
          name: 'pageSize', 
          in: 'query', 
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 12 }
        },
        SongIdPath: { 
          name: 'id', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' }
        },
        UserIdPath: { 
          name: 'id', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' }
        },
        PlaylistIdPath: { 
          name: 'id', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' }
        },
      },
      schemas: {
        ErrorResponse: { 
          type: 'object', 
          properties: { message: { type: 'string' } } 
        },
      },
      responses: {
        BadRequest: { 
          description: 'Bad Request', 
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } 
        },
        Unauthorized: { 
          description: 'Unauthorized', 
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } 
        },
        NotFound: { 
          description: 'Not Found', 
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } 
        },
        ServerError: { 
          description: 'Server Error', 
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } 
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
  path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../routes/**/*.js'),   // ✅ اضافه کن
  path.join(__dirname, '../controllers/**/*.js')
],
});