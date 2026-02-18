import supabase from '../supabase';
import { VaultItem } from '../supabase/types';

/**
 * Trash Service for StashSnap Vault
 * Handles soft-delete, restoration, and permanent cleanup of items.
 */
export const trashService = {
    /**
     * Moves an item to the trash (Soft Delete)
     */
    async moveToTrash(itemId: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day retention

        const { data, error } = await supabase
            .from('items')
            .update({
                deleted_at: new Date().toISOString(),
                trash_expires_at: expiresAt.toISOString(),
            })
            .eq('id', itemId)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Restores an item from the trash
     */
    async restoreFromTrash(itemId: string) {
        const { data, error } = await supabase
            .from('items')
            .update({
                deleted_at: null,
                trash_expires_at: null,
            })
            .eq('id', itemId)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Permanently deletes an item
     */
    async permanentlyDelete(itemId: string) {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
    },

    /**
     * Fetches all items currently in the trash for a specific user
     */
    async getTrashItems(userId: string) {
        const { data, error } = await supabase
            .from('items')
            .select('*, category:categories(*)')
            .eq('user_id', userId)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });

        if (error) throw error;
        return data as VaultItem[];
    },

    /**
     * Empties the trash for a user
     */
    async emptyTrash(userId: string) {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('user_id', userId)
            .not('deleted_at', 'is', null);

        if (error) throw error;
    }
};
