import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Searching for NORTON in "trash" table...')
    const { data: trash, error } = await supabase
        .from('trash')
        .select('*')

    if (error) {
        console.warn('Error querying "trash":', error.message)
        return
    }

    console.log('Trash records found:', trash ? trash.length : 0)
    trash.forEach(t => {
        const itemData = t.item_data
        if (JSON.stringify(itemData).toUpperCase().includes('NORTON')) {
            console.log('*** FOUND IN TRASH ***')
            console.log(JSON.stringify(t, null, 2))
        }
    })
}

run()
