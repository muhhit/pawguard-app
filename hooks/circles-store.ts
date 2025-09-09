import createContextHook from '@nkzw/create-context-hook';
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Circle { id: string; name: string; description?: string | null; city?: string | null; created_by: string; created_at: string; }
export interface CircleMember { id: string; circle_id: string; user_id: string; role: 'member'|'admin'; created_at: string; }
export interface CirclePost { id: string; circle_id: string; author_id: string; content?: string | null; images?: string[] | null; created_at: string; }

export const [CirclesProvider, useCircles] = createContextHook(() => {
  const listCircles = useCallback(async (): Promise<Circle[]> => {
    if (!(supabase as any)?.from) return [];
    const { data, error } = await supabase.from('circles').select('*').order('created_at', { ascending: false });
    if (error) throw error; return (data || []) as Circle[];
  }, []);

  const createCircle = useCallback(async (name: string, description?: string) => {
    const user = (await supabase.auth.getUser()).data.user?.id;
    if (!(supabase as any)?.from || !user) return null;
    const { data, error } = await supabase.from('circles').insert({ name, description, created_by: user }).select('*').single();
    if (error) throw error; return data as Circle;
  }, []);

  const joinCircle = useCallback(async (circleId: string) => {
    const user = (await supabase.auth.getUser()).data.user?.id;
    if (!(supabase as any)?.from || !user) return null;
    const { data, error } = await supabase.from('circle_members').insert({ circle_id: circleId, user_id: user }).select('*').single();
    if (error) throw error; return data as CircleMember;
  }, []);

  return { listCircles, createCircle, joinCircle };
});

