import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export interface RescueChannel {
  id: string;
  pet_id: string;
  owner_id: string;
  created_at: string;
}

export interface RescueTask {
  id: string;
  channel_id: string;
  title: string;
  notes?: string | null;
  status: 'open' | 'doing' | 'done';
  assignee?: string | null;
  created_at: string;
}

export const [RescueProvider, useRescue] = createContextHook(() => {
  const createChannel = useCallback(async (petId: string, ownerId: string) => {
    if (!supabase) return { id: 'mock', pet_id: petId, owner_id: ownerId, created_at: new Date().toISOString() } as RescueChannel;
    const { data, error } = await supabase.from('rescue_channels').insert({ pet_id: petId, owner_id: ownerId }).select('*').single();
    if (error) throw error;
    return data as RescueChannel;
  }, []);

  const addTask = useCallback(async (channelId: string, title: string, notes?: string) => {
    if (!supabase) return { id: 'mock-task', channel_id: channelId, title, notes, status: 'open', created_at: new Date().toISOString() } as RescueTask;
    const { data, error } = await supabase.from('rescue_tasks').insert({ channel_id: channelId, title, notes }).select('*').single();
    if (error) throw error;
    return data as RescueTask;
  }, []);

  const listTasks = useCallback(async (channelId: string) => {
    if (!supabase) return [
      { id: 't1', channel_id: channelId, title: 'Afiş asma', status: 'open', created_at: new Date().toISOString() },
      { id: 't2', channel_id: channelId, title: 'Bölge taraması', status: 'doing', created_at: new Date().toISOString() }
    ] as RescueTask[];
    const { data, error } = await supabase.from('rescue_tasks').select('*').eq('channel_id', channelId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as RescueTask[];
  }, []);

  return useMemo(() => ({ createChannel, addTask, listTasks }), [createChannel, addTask, listTasks]);
});

