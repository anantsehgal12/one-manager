import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for authenticated user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations (like storage uploads)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

if (!supabaseAdmin) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Storage uploads may fail due to RLS policies.')
}

// Helper function to ensure storage bucket exists
export const ensureStorageBucket = async (bucketName: string = 'company-logos'): Promise<void> => {
  try {
    // Use admin client for bucket operations
    const client = supabaseAdmin || supabase
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await client.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`)
      const { error: createError } = await client.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError)
        throw new Error(`Failed to create storage bucket: ${createError.message}`)
      }
      
      console.log(`Storage bucket '${bucketName}' created successfully`)
    }
  } catch (error) {
    console.error('Error ensuring storage bucket:', error)
    // Don't throw error - let upload attempt proceed
  }
}

// Helper function to upload logo to Supabase storage
export const uploadLogo = async (
  file: File, 
  orgId: string, 
  companyId: string
): Promise<string> => {
  // Use admin client for storage operations to bypass RLS policies
  const client = supabaseAdmin || supabase
  
  // Ensure the storage bucket exists
  await ensureStorageBucket('company-logos')
  
  const fileExt = file.name.split('.').pop()
  const fileName = `logo.${fileExt}`
  const filePath = `${orgId}/${companyId}/${fileName}`

  // Upload the file
  const { data, error } = await client.storage
    .from('company-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    throw new Error(`Failed to upload logo: ${error.message}`)
  }

  // Get the public URL (always use regular client for public URLs)
  const { data: urlData } = supabase.storage
    .from('company-logos')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

// Helper function to delete logo from Supabase storage
export const deleteLogo = async (logoUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(logoUrl)
    const pathSegments = url.pathname.split('/')
    const filePath = pathSegments.slice(-3).join('/') // orgId/companyId/filename

    const { error } = await supabase.storage
      .from('company-logos')
      .remove([filePath])

    if (error) {
      console.error('Error deleting logo:', error.message)
    }
  } catch (error) {
    console.error('Error parsing logo URL:', error)
  }
}

// Helper function to validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 2MB' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type must be JPEG, PNG, WebP, or GIF' }
  }

  return { valid: true }
}

