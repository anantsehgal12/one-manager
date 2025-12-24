import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage bucket...')

    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('company-logos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 10 * 1024 * 1024 // 10MB
    })

    if (bucketError) {
      console.error('Error creating bucket:', bucketError.message)
      return
    }

    console.log('✅ Bucket created successfully:', bucket)

    // Set up RLS policies for public access
    const { error: policyError } = await supabase.rpc('create_storage_policies')

    if (policyError) {
      console.error('Error setting up policies:', policyError.message)
    } else {
      console.log('✅ Storage policies set up successfully')
    }

    console.log('✅ Supabase storage setup completed!')
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupStorage()
