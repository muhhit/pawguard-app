import { supabase } from '@/lib/supabase';

export async function logEvent(event: string, properties?: Record<string, any>) {
  try {
    if (!(supabase as any)?.from) return;
    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;
    await supabase.from('analytics_events').insert({ user_id: userId, event, properties: properties || {} });
  } catch (e) {
    // swallow
  }
}

