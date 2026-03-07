-- Insert teachers
INSERT INTO teachers (email, name) VALUES
('profesor1@escuela.edu', 'Profesor Uno'),
('profesor2@escuela.edu', 'Profesor Dos'),
('profesor3@escuela.edu', 'Profesor Tres')
ON CONFLICT (email) DO NOTHING;

-- Insert 15 courses
INSERT INTO courses (name, description, max_capacity) VALUES
('Matemáticas Avanzadas', 'Curso de matemáticas de nivel superior', 14),
('Física Cuántica', 'Introducción a la mecánica cuántica', 14),
('Literatura Universal', 'Análisis de obras clásicas', 14),
('Historia del Arte', 'Recorrido por los movimientos artísticos', 14),
('Programación en Python', 'Fundamentos de programación', 14),
('Biología Celular', 'Estudio de la célula y sus funciones', 14),
('Química Orgánica', 'Estructura y reactividad de compuestos', 14),
('Filosofía Moderna', 'Pensadores del siglo XVII al XIX', 14),
('Economía Básica', 'Principios de micro y macroeconomía', 14),
('Psicología General', 'Introducción a la mente humana', 14),
('Sociología', 'Estudio de las sociedades humanas', 14),
('Geografía Física', 'Elementos del medio físico', 14),
('Inglés Académico', 'Lectura y escritura académica', 14),
('Estadística Aplicada', 'Análisis de datos', 14),
('Marketing Digital', 'Estrategias de mercadeo en línea', 14)
ON CONFLICT DO NOTHING;

-- Insert blocks for courses (A and B)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM courses LOOP
        -- Block A
        INSERT INTO course_blocks (course_id, block_name, available_slots, total_capacity)
        VALUES (r.id, 'A', 14, 14)
        ON CONFLICT (course_id, block_name) DO NOTHING;

        -- Block B
        INSERT INTO course_blocks (course_id, block_name, available_slots, total_capacity)
        VALUES (r.id, 'B', 14, 14)
        ON CONFLICT (course_id, block_name) DO NOTHING;
    END LOOP;
END $$;
