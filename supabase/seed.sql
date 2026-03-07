-- Seed Courses
INSERT INTO courses (name, description, max_capacity) VALUES
('Matemáticas Avanzadas', 'Curso de cálculo y álgebra lineal aplicada', 14),
('Física Cuántica', 'Introducción a la mecánica cuántica', 14),
('Literatura Universal', 'Análisis de obras clásicas y contemporáneas', 14),
('Historia del Arte', 'Recorrido por los movimientos artísticos principales', 14),
('Programación en Python', 'Fundamentos de programación y ciencia de datos', 14),
('Biología Molecular', 'Estudio de la estructura y función de los genes', 14),
('Economía Global', 'Tendencias macroeconómicas actuales', 14),
('Psicología Educativa', 'Teorías del aprendizaje y desarrollo cognitivo', 14),
('Inglés Académico', 'Redacción y comprensión lectora avanzada', 14),
('Filosofía Moderna', 'Corrientes filosóficas del siglo XX', 14),
('Química Orgánica', 'Estructura y reactividad de compuestos de carbono', 14),
('Sociología Urbana', 'Dinámicas sociales en entornos urbanos', 14),
('Música y Tecnología', 'Producción musical y herramientas digitales', 14),
('Derecho Constitucional', 'Principios fundamentales de la constitución', 14),
('Gestión de Proyectos', 'Metodologías ágiles y tradicionales', 14);

-- Seed Blocks for each course (A and B)
INSERT INTO course_blocks (course_id, block_name, available_slots, total_capacity)
SELECT id, 'A', 14, 14 FROM courses
UNION ALL
SELECT id, 'B', 14, 14 FROM courses;

-- Seed Teachers (Whitelist)
INSERT INTO teachers (email, name) VALUES
('profesor1@escuela.edu', 'Juan Pérez'),
('profesor2@escuela.edu', 'María García'),
('profesor3@escuela.edu', 'Carlos López'),
('admin@escuela.edu', 'Administrador Sistema');
