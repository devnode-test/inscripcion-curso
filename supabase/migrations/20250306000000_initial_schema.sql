-- Create tables
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_capacity INTEGER DEFAULT 14,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    block_name VARCHAR(10) NOT NULL, -- 'A' or 'B'
    available_slots INTEGER DEFAULT 14,
    total_capacity INTEGER DEFAULT 14,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, block_name)
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE selected_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    block_id UUID REFERENCES course_blocks(id),
    priority INTEGER DEFAULT 1, -- 1 or 2
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_registrations_teacher ON registrations(teacher_id);
CREATE INDEX idx_selected_courses_registration ON selected_courses(registration_id);
CREATE INDEX idx_course_blocks_course ON course_blocks(course_id);

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON teachers TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT ON course_blocks TO anon, authenticated;
GRANT INSERT ON registrations TO anon, authenticated;
GRANT INSERT ON selected_courses TO anon, authenticated;
GRANT UPDATE ON course_blocks TO anon, authenticated; -- Need update to decrement slots

-- RLS Policies

-- Teachers: Public read (for validation), Admin write
CREATE POLICY "Allow public read access to teachers" ON teachers
    FOR SELECT USING (true);

-- Courses: Public read, Admin write
CREATE POLICY "Allow public read access to courses" ON courses
    FOR SELECT USING (true);

-- Course Blocks: Public read, Public update (for slot management), Admin write
CREATE POLICY "Allow public read access to course_blocks" ON course_blocks
    FOR SELECT USING (true);

CREATE POLICY "Allow public update to course_blocks" ON course_blocks
    FOR UPDATE USING (true);

-- Registrations: Public insert, Admin read
CREATE POLICY "Allow public insert to registrations" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read to registrations" ON registrations
    FOR SELECT USING (true);

-- Selected Courses: Public insert, Admin read
CREATE POLICY "Allow public insert to selected_courses" ON selected_courses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read to selected_courses" ON selected_courses
    FOR SELECT USING (true);
