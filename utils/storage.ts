import { supabase } from '@/lib/supabase';

export async function uploadEvidenceImage(localUri: string, claimId: string): Promise<string> {
  if (!(supabase as any)?.storage) throw new Error('Storage not configured');
  const res = await fetch(localUri);
  const blob = await res.blob();
  const filePath = `evidence/${claimId}-${Date.now()}.jpg`;
  const { data, error } = await supabase.storage.from('evidence').upload(filePath, blob as any, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from('evidence').getPublicUrl(data.path);
  return pub?.publicUrl || data.path;
}
