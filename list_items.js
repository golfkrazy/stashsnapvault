import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Fetching first 100 items...')
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .limit(100)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    console.log(`Found ${data.length} items. Listing titles:`)
    data.forEach(item => {
        console.log(`- [${item.user_id}] ${item.title}`)
    })
}

run()
