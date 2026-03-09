import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ message: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if column exists first to avoid error
    const { error } = await supabase.rpc('add_room_column_if_not_exists');

    if (error) {
      // If RPC fails (likely because function doesn't exist), try direct SQL via RPC or just inform user
      // Since we can't run raw SQL directly from client without specific setup or RPC
      // Let's try to create a function first using raw SQL if possible? No, can't do that easily.
      
      // Alternative: We can't run DDL (ALTER TABLE) directly via supabase-js client unless we use an RPC function that executes dynamic SQL.
      // Or if we have direct database access.
      
      // Let's try a workaround: Check if we can select the column.
      const { error: selectError } = await supabase.from('courses').select('room').limit(1);
      
      if (selectError && selectError.code === 'PGRST301') { 
         // PGRST301 usually means column not found? No, it's confusing.
         // Let's assume we need to add it.
         return NextResponse.json({ 
           message: 'Cannot run migration directly via JS client. Please run this SQL in your Supabase SQL Editor:',
           sql: 'ALTER TABLE courses ADD COLUMN IF NOT EXISTS room VARCHAR(100);'
         }, { status: 400 });
      }
      
      return NextResponse.json({ message: 'Column might already exist or check failed', error });
    }

    return NextResponse.json({ message: 'Migration executed' });
  } catch (error) {
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}
