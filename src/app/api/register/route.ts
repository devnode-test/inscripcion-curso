import { resend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const SETTINGS_EMAIL = "__settings__registrations@system.local";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, course1_id, course1_block, course2_id, course2_block } =
      body;

    // 0. Check if registrations are open
    // Read registrations status from sentinel row
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("teachers")
      .select("is_active")
      .eq("email", SETTINGS_EMAIL)
      .maybeSingle();

    const registrationsOpen = settingsError ? false : (settings?.is_active ?? true);

    if (!registrationsOpen) {
      return NextResponse.json(
        {
          success: false,
          message: "Las inscripciones están cerradas. No se aceptan más inscripciones.",
        },
        { status: 403 },
      );
    }

    // 1. Call the RPC function to register
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "register_teacher",
      {
        p_email: email,
        p_course1_id: course1_id,
        p_course1_block_name: course1_block,
        p_course2_id: course2_id,
        p_course2_block_name: course2_block,
      },
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        {
          success: false,
          message: "Error interno del servidor al procesar la inscripción.",
        },
        { status: 500 },
      );
    }

    if (!rpcData.success) {
      return NextResponse.json(
        { success: false, message: rpcData.message },
        { status: 400 },
      );
    }

    const registrationId = rpcData.registration_id;

    // 2. Fetch details for email
    // We need teacher name, course names
    const { data: registrationDetails, error: detailsError } = await supabase
      .from("registrations")
      .select(
        `
        teacher:teachers(name, email),
        selected_courses(
          course:courses(name, room),
          block:course_blocks(block_name)
        )
      `,
      )
      .eq("id", registrationId)
      .single();

    if (detailsError) {
      console.error("Details Error:", detailsError);
      // Registration was successful, just failed to fetch details for email.
      // We still return success but maybe log this.
    }

    // 3. Send Email
    if (
      registrationDetails &&
      process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== "re_123456789"
    ) {
      type RegistrationTeacher = { name: string | null; email: string | null };
      type RegistrationCourse = { name: string | null; room: string | null };
      type RegistrationBlock = { block_name: string | null };
      type SelectedCourse = {
        course: RegistrationCourse | RegistrationCourse[] | null;
        block: RegistrationBlock | RegistrationBlock[] | null;
      };
      type RegistrationDetails = {
        teacher: RegistrationTeacher | RegistrationTeacher[] | null;
        selected_courses: SelectedCourse[] | null;
      };

      const details = registrationDetails as unknown as RegistrationDetails;
      const teacher = Array.isArray(details.teacher)
        ? details.teacher[0]
        : details.teacher;
      const teacherName = teacher?.name || "Profesor";
      const teacherEmail = teacher?.email || email;
      const courses = (details.selected_courses ?? [])
        .map((sc) => {
          const course = Array.isArray(sc.course) ? sc.course[0] : sc.course;
          const block = Array.isArray(sc.block) ? sc.block[0] : sc.block;
          return {
            name: course?.name,
            room: course?.room,
            block: block?.block_name,
          };
        })
        .sort((a, b) => (a.block || "").localeCompare(b.block || ""));

      try {
        await resend.emails.send({
          from: "Inscripciones <inscripciones@alexanardi.com>",
          to: teacherEmail,
          subject: "Confirmación de Inscripción de Prácticas",
          html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  background-color: #f3f4f6;
                  margin: 0;
                  padding: 40px 0;
                  color: #1f2937;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  overflow: hidden;
                }
                .header {
                  padding: 32px;
                  text-align: center;
                  background-color: #ffffff;
                  border-bottom: 1px solid #e5e7eb;
                }
                .logo {
                  max-height: 160px;
                  width: auto;
                }
                .content {
                  padding: 32px;
                  text-align: center;
                }
                h1 {
                  font-size: 24px;
                  font-weight: 700;
                  color: #111827;
                  margin-bottom: 16px;
                }
                p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #4b5563;
                  margin-bottom: 24px;
                }
                .course-list {
                  text-align: left;
                  background-color: #f9fafb;
                  border-radius: 6px;
                  padding: 24px;
                  margin: 0 auto 32px;
                  display: inline-block;
                  width: 100%;
                  box-sizing: border-box;
                }
                .course-item {
                  padding: 12px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .course-item:last-child {
                  border-bottom: none;
                }
                .course-name {
                  font-weight: 600;
                  color: #111827;
                  display: block;
                  margin-bottom: 4px;
                }
                .course-room {
                  font-size: 13px;
                  color: #6b7280;
                  display: block;
                  margin-bottom: 4px;
                }
                .course-block {
                  display: inline-block;
                  background-color: #d1fae5;
                  color: #065f46;
                  font-size: 12px;
                  font-weight: 600;
                  padding: 2px 8px;
                  border-radius: 9999px;
                }
                .footer {
                  padding: 24px;
                  text-align: center;
                  font-size: 12px;
                  color: #9ca3af;
                  border-top: 1px solid #e5e7eb;
                  background-color: #f9fafb;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://saintgeorge.cl/wp-content/uploads/2026/02/logo_sgc_90.png" alt="Saint George's College" class="logo">
                </div>
                <div class="content">
                  <h1>¡Inscripción Confirmada!</h1>
                  <p>Hola <strong>${teacherName}</strong>,</p>
                  <p>Hemos registrado exitosamente tu selección de prácticas. A continuación encontrarás el detalle:</p>

                  <div class="course-list">
                    ${courses
                      .map(
                        (c) => `
                      <div class="course-item">
                        <span class="course-name">${c.name}</span>
                        ${c.room ? `<span class="course-room">Sala: ${c.room}</span>` : ""}
                        <span class="course-block">Bloque ${c.block}</span>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                  
                  <p>Si tienes alguna duda contacta a:</p>
                  <p><strong>Paula Ugarte - Patricia Albertini - Ma. José Riveros</strong></p>
                </div>
                <div class="footer">
                  Informática | Saint George's College
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Email Sending Error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Inscripción realizada con éxito.",
      registration_id: registrationId,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Error inesperado." },
      { status: 500 },
    );
  }
}
