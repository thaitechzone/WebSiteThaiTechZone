-- Thai Tech Zone Database Schema
-- PostgreSQL

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS enrollment CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  profile_picture_url TEXT,
  bio TEXT,
  role VARCHAR(50) DEFAULT 'student', -- student, instructor, admin
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_id UUID UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL, -- labview, automation, python, robotics, etc.
  level VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced
  instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration_hours INTEGER,
  total_lessons INTEGER,
  max_students INTEGER,
  current_students INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  video_preview_url TEXT,
  course_content JSON, -- detailed course outline
  learning_outcomes TEXT[],
  requirements TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollment Table
CREATE TABLE enrollment (
  id SERIAL PRIMARY KEY,
  enrollment_id UUID UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, dropped, pending
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  certificate_url TEXT,
  notes TEXT,
  UNIQUE(user_id, course_id)
);

-- Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  payment_id UUID UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id INTEGER NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'THB',
  payment_method VARCHAR(50), -- credit_card, bank_transfer, omise, stripe
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  stripe_charge_id VARCHAR(255),
  omise_charge_id VARCHAR(255),
  transaction_id VARCHAR(255) UNIQUE,
  description TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  message_id UUID UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new', -- new, read, replied, closed
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high
  reply_message TEXT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_enrollment_user_id ON enrollment(user_id);
CREATE INDEX idx_enrollment_course_id ON enrollment(course_id);
CREATE INDEX idx_enrollment_status ON enrollment(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_email ON contact_messages(email);

-- Create some sample data for testing
INSERT INTO users (user_id, email, password_hash, first_name, last_name, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'admin@thaitechzone.com',
  '$2b$10$...',  -- This will be a bcrypt hash
  'Admin',
  'User',
  'admin'
);

INSERT INTO courses (course_id, title, description, course_code, category, level, price, duration_hours, total_lessons, thumbnail_url)
VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001'::UUID,
    'LabVIEW Fundamentals',
    'เรียนรู้พื้นฐาน LabVIEW จากเบื้องต้น',
    'LV101',
    'labview',
    'beginner',
    2999.00,
    40,
    20,
    'https://via.placeholder.com/400x300?text=LabVIEW+Fundamentals'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002'::UUID,
    'Advanced LabVIEW',
    'โปรแกรมขั้นสูง LabVIEW สำหรับการประยุกต์จริง',
    'LV201',
    'labview',
    'advanced',
    4999.00,
    60,
    30,
    'https://via.placeholder.com/400x300?text=Advanced+LabVIEW'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003'::UUID,
    'N8N AI Automation',
    'สร้างระบบอัตโนมัติด้วย N8N และ AI',
    'N8N101',
    'automation',
    'intermediate',
    3499.00,
    45,
    25,
    'https://via.placeholder.com/400x300?text=N8N+Automation'
  );

-- Verify schema creation
SELECT 'Schema created successfully!' AS status;
