CREATE OR REPLACE FUNCTION register_teacher(
    p_email VARCHAR,
    p_course1_id UUID,
    p_course1_block_name VARCHAR,
    p_course2_id UUID,
    p_course2_block_name VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_teacher_id UUID;
    v_registration_id UUID;
    v_block1_id UUID;
    v_block2_id UUID;
    v_slots1 INTEGER;
    v_slots2 INTEGER;
BEGIN
    -- 1. Check if teacher exists
    SELECT id INTO v_teacher_id FROM teachers WHERE email = p_email;
    IF v_teacher_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'El correo electrónico no está registrado en la lista de profesores.');
    END IF;

    -- 2. Check if teacher already registered
    IF EXISTS (SELECT 1 FROM registrations WHERE teacher_id = v_teacher_id AND status = 'completed') THEN
        RETURN json_build_object('success', false, 'message', 'Ya has realizado tu inscripción previamente.');
    END IF;

    -- 3. Get Block IDs and check availability for Course 1
    SELECT id, available_slots INTO v_block1_id, v_slots1
    FROM course_blocks
    WHERE course_id = p_course1_id AND block_name = p_course1_block_name
    FOR UPDATE; -- Lock the row

    IF v_block1_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'El bloque seleccionado para el primer curso no existe.');
    END IF;

    IF v_slots1 <= 0 THEN
        RETURN json_build_object('success', false, 'message', 'No hay cupos disponibles para el primer curso en el bloque seleccionado.');
    END IF;

    -- 4. Get Block IDs and check availability for Course 2
    SELECT id, available_slots INTO v_block2_id, v_slots2
    FROM course_blocks
    WHERE course_id = p_course2_id AND block_name = p_course2_block_name
    FOR UPDATE; -- Lock the row

    IF v_block2_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'El bloque seleccionado para el segundo curso no existe.');
    END IF;

    IF v_slots2 <= 0 THEN
        RETURN json_build_object('success', false, 'message', 'No hay cupos disponibles para el segundo curso en el bloque seleccionado.');
    END IF;

    -- 5. Perform Registration
    
    -- Decrement slots
    UPDATE course_blocks SET available_slots = available_slots - 1 WHERE id = v_block1_id;
    UPDATE course_blocks SET available_slots = available_slots - 1 WHERE id = v_block2_id;

    -- Create Registration
    INSERT INTO registrations (teacher_id, status)
    VALUES (v_teacher_id, 'completed')
    RETURNING id INTO v_registration_id;

    -- Add Selected Courses
    INSERT INTO selected_courses (registration_id, course_id, block_id, priority)
    VALUES 
        (v_registration_id, p_course1_id, v_block1_id, 1),
        (v_registration_id, p_course2_id, v_block2_id, 2);

    RETURN json_build_object(
        'success', true, 
        'message', 'Inscripción realizada con éxito.',
        'registration_id', v_registration_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Ocurrió un error inesperado: ' || SQLERRM);
END;
$$;
