import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Searching for NORTON in "items" table...')
    const { data: items, error: error1 } = await supabase
        .from('items')
        .select('*')
        .or('title.ilike.%NORTON%,description.ilike.%NORTON%')

    if (error1) {
        console.warn('Error querying "items":', error1.message)
    } else {
        console.log('Results from "items":', items ? items.length : 0)
        if (items && items.length > 0) console.log(JSON.stringify(items, null, 2))
    }

    console.log('Searching for NORTON in "vault_items" table...')
    const { data: vaultItems, error: error2 } = await supabase
        .from('vault_items')
        .select('*')
        .or('title.ilike.%NORTON%,description.ilike.%NORTON%')

    if (error2) {
        console.warn('Error querying "vault_items":', error2.message)
    } else {
        console.log('Results from "vault_items":', vaultItems ? vaultItems.length : 0)
        if (vaultItems && vaultItems.length > 0) console.log(JSON.stringify(vaultItems, null, 2))
    }
}

run()
