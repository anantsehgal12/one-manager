import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n🔍 Testing basic connection...')
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      return
    }
    
    console.log('✅ Database connection successful')

    // Test storage buckets
    console.log('\n🔍 Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Buckets error:', bucketsError.message)
      return
    }
    
    console.log('Available buckets:', buckets.map(b => b.name))
    
    // Check if company-logos bucket exists
    const companyLogosBucket = buckets.find(b => b.name === 'company-logos')
    
    if (!companyLogosBucket) {
      console.log('⚠️  company-logos bucket not found. Creating it...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('company-logos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10 * 1024 * 1024 // 2MB
      })
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message)
        return
      }
      
      console.log('✅ Bucket created successfully:', newBucket.name)
    } else {
      console.log('✅ company-logos bucket exists')
    }

    // Test file upload
    console.log('\n🔍 Testing file upload...')
    const testFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload('test/test-logo.png', testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message)
      return
    }
    
    console.log('✅ File upload successful:', uploadData.path)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('company-logos')
      .getPublicUrl('test/test-logo.png')
    
    console.log('✅ Public URL:', urlData.publicUrl)
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testConnection()
