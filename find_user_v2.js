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

    if (error) {
        console.error('Error querying user_profiles:', error.message)
        return
    }

    if (data.length === 0) {
        console.log('No profile found in user_profiles.')
        return
    }

    const userId = data[0].id
    console.log('User found:', userId)

    console.log('Fetching all items for this user...')
    const { data: items, error: iError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)

    if (iError) {
        console.error('Error fetching items:', iError.message)
        return
    }

    console.log(`Found ${items.length} items.`)
    items.forEach(item => {
        console.log(`- [${item.id}] ${item.title} (Photo: ${item.photo_url ? 'YES' : 'NO'})`)
        if (item.title && item.title.toUpperCase().includes('NORTON')) {
            console.log('  *** MATCH FOUND ***')
            console.log(JSON.stringify(item, null, 2))
        }
    })
}

run()
