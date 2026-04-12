const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Thai Tech Zone API',
      version: '1.0.0',
      description: 'REST API สำหรับระบบคอร์สออนไลน์ Thai Tech Zone\n\n**วิธีใช้งาน:**\n1. เรียก `POST /api/auth/login` เพื่อรับ token\n2. กด **Authorize** แล้วใส่ `Bearer <token>`\n3. เรียก endpoint ที่ต้องการได้เลย',
      contact: {
        name: 'Thai Tech Zone',
        email: 'admin@thaitechzone.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'สมชาย' },
            lastName: { type: 'string', example: 'ใจดี' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin'], example: 'student' },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            course_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'LabVIEW Fundamentals' },
            description: { type: 'string' },
            course_code: { type: 'string', example: 'LV101' },
            category: { type: 'string', example: 'labview' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            price: { type: 'number', example: 2999 },
            duration_hours: { type: 'integer', example: 40 },
            total_lessons: { type: 'integer', example: 20 },
            is_published: { type: 'boolean', example: true },
            rating: { type: 'number', example: 4.5 },
          },
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            enrollment_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'integer' },
            course_id: { type: 'integer' },
            status: { type: 'string', enum: ['active', 'completed', 'dropped', 'pending'] },
            progress_percentage: { type: 'integer', example: 0 },
            enrollment_date: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            payment_id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', example: 2999 },
            currency: { type: 'string', example: 'THB' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            payment_method: { type: 'string', example: 'stripe' },
          },
        },
        ContactMessage: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            message_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'สมชาย ใจดี' },
            email: { type: 'string', format: 'email' },
            subject: { type: 'string', example: 'สอบถามเรื่องคอร์ส' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['new', 'read', 'replied', 'closed'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
