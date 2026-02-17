import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdgsmaxevwrinigwsdeu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ3NtYXhldndyaW5pZ3dzZGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzM0MDAsImV4cCI6MjA4NDYwOTQwMH0.uxb2CQkm3zkaH_VBKR_5i25JaVen1aGTntfFgvPdNz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkParity() {
    console.log('--- StashSnap Schema Parity Check ---');
    console.log('Target Project: sdgsmaxevwrinigwsdeu\n');

    const checks = [
        { name: 'items.effective_date', table: 'items', column: 'effective_date' },
        { name: 'items.expiration_date', table: 'items', column: 'expiration_date' },
        { name: 'items.reminder_enabled', table: 'items', column: 'reminder_enabled' },
        { name: 'items.jurisdiction_city', table: 'items', column: 'jurisdiction_city' },
        { name: 'items.jurisdiction_state', table: 'items', column: 'jurisdiction_state' },
        { name: 'items.jurisdiction_country', table: 'items', column: 'jurisdiction_country' },
        { name: 'items.embedding', table: 'items', column: 'embedding' },
        { name: 'items.location_embedding', table: 'items', column: 'location_embedding' },
        { name: 'user_profiles.phone_number', table: 'user_profiles', column: 'phone_number' },
        { name: 'user_profiles.city', table: 'user_profiles', column: 'city' },
        { name: 'user_profiles.state', table: 'user_profiles', column: 'state' },
        { name: 'user_profiles.country', table: 'user_profiles', column: 'country' },
        { name: 'user_profiles.subscription_tier', table: 'user_profiles', column: 'subscription_tier' },
        { name: 'user_profiles.subscription_status', table: 'user_profiles', column: 'subscription_status' }
    ];

    console.log('1. COLUMN CHECKS:');
    for (const check of checks) {
        const { error } = await supabase.from(check.table).select(check.column).limit(0);
        if (error) {
            console.log(`[MISSING] ${check.name} - Error: ${error.message}`);
        } else {
            console.log(`[MATCH]   ${check.name}`);
        }
    }

    console.log('\n2. TABLE CHECKS:');
    const { error: lockoutError } = await supabase.from('auth_lockouts').select('email').limit(0);
    if (lockoutError) {
        console.log(`[MISSING] auth_lockouts table - Error: ${lockoutError.message}`);
    } else {
        console.log(`[MATCH]   auth_lockouts table`);
    }

    console.log('\n3. RPC CHECKS (Function Existence):');
    const rpcs = [
        'match_items',
        'get_all_items_admin',
        'get_system_stats_admin',
        'sync_user_profiles_admin',
        'get_auth_lockout_status'
    ];

    for (const rpc of rpcs) {
        let call = supabase.rpc(rpc);

        // Provide dummy args for functions with required parameters to avoid 404 signature mismatches
        if (rpc === 'match_items') {
            call = supabase.rpc(rpc, { query_embedding: new Array(512).fill(0) });
        } else if (rpc === 'get_auth_lockout_status') {
            call = supabase.rpc(rpc, { p_email: 'test@example.com' });
        }

        const { error } = await call.limit(0);

        // PGRST202 is usually "Function not found"
        // 42883 is "operator does not exist" or function signature mismatch
        // If it's anything EXCEPT 404/not exist, it likely exists but just failed our dummy call.
        if (error && (error.message.includes('not exist') || error.code === 'PGRST202')) {
            console.log(`[MISSING] RPC ${rpc} - Error: ${error.message}`);
        } else {
            console.log(`[MATCH]   RPC ${rpc} (Found)`);
        }
    }

    console.log('\n--- Parity Check Complete ---');
}

checkParity();
