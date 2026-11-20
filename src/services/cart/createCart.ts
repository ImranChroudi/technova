import { supabase } from '@/lib/supabase/client';
import { CartType, CartStatus } from '@/types';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/supabase/clientUtils';

export async function createCart() {
  try {
    const user = await getClientUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Ensure a profile row exists (carts.user_id -> profiles.profile_id FK).
    // Use a minimal upsert so it works regardless of which optional columns
    // (email, role, avatar_url, ...) exist in the profiles table.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ profile_id: user.id }, { onConflict: 'profile_id', ignoreDuplicates: true });
    if (profileError && profileError.code !== '23505') {
      console.error('Error ensuring profile:', profileError);
    }

    const { data, error } = await supabase
      .from('carts')
      .insert({
        user_id: user.id,
        status: 'active' as CartStatus,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      toast.error('Failed to create cart');
      return null;
    }

    return data as CartType;
  } catch (error) {
    console.error('Error in createCart:', error);
    toast.error('Something went wrong');
    return null;
  }
}
