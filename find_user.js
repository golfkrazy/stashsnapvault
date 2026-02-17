import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Searching for user by email: mrosamt@outlook.com')
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'mrosamt@outlook.com')
        .single()

    if (error) {
        console.warn('Error querying user_profiles:', error.message)
        // Try profiles if user_profiles fails
        const { data: pData, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'mrosamt@outlook.com')
            .single()

        if (pError) {
            console.error('Error querying profiles:', pError.message)
            return
        }
        console.log('User Profile (from "profiles"):', JSON.stringify(pData, null, 2))
        return
    }

    console.log('User Profile (from "user_profiles"):', JSON.stringify(data, null, 2))
}

run()
