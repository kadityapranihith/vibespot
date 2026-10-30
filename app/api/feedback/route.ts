import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminRequest } from '@/lib/admin-server';

/**
 * POST /api/feedback
 * Public endpoint for users/visitors to submit feedback or bug reports
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic = 'other', subject, description, sender_name, sender_email } = body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Please enter a description for your feedback.' },
        { status: 400 }
      );
    }

    const validTopics = ['bug', 'feature', 'place', 'other'];
    const cleanTopic = validTopics.includes(topic) ? topic : 'other';

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        topic: cleanTopic,
        subject: subject ? String(subject).trim() : null,
        description: description.trim(),
        sender_name: sender_name ? String(sender_name).trim() : null,
        sender_email: sender_email ? String(sender_email).trim() : null,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase feedback insert error:', error);
      return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: data,
    });
  } catch (err) {
    console.error('Feedback POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/feedback
 * Admin-only endpoint to view all feedback and bug reports
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase feedback GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data || [] });
  } catch (err) {
    console.error('Feedback GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/feedback
 * Admin-only endpoint to update feedback status ('new', 'in_progress', 'resolved')
 */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase feedback PATCH error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (err) {
    console.error('Feedback PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/feedback?id=123
 * Admin-only endpoint to delete feedback item
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing feedback id' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('feedback').delete().eq('id', id);

    if (error) {
      console.error('Supabase feedback DELETE error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Feedback removed' });
  } catch (err) {
    console.error('Feedback DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

