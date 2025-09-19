import createContextHook from "@nkzw/create-context-hook";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const [ReportProvider, useReport] = createContextHook(() => {
  const reportPet = useCallback(async (petId: string, reason: string, details?: string) => {
    if (!supabase) return { id: 'mock', pet_id: petId, reason, details };
    const userRes = await supabase.auth.getUser();
    const reporter = userRes.data.user?.id;
    const { data, error } = await supabase.from('content_reports').insert({ reporter_id: reporter, pet_id: petId, reason, details }).select('*').single();
    if (error) throw error;
    return data;
  }, []);
  return { reportPet };
});

