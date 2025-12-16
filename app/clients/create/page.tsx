'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'react-hot-toast'
import Side from '@/app/_components/Side'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/app/_components/Header'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobileNo: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  companyName: z.string().optional(),
  gst: z.string().optional(),
  billingMainAddress: z.string().optional(),
  billingPincode: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string(),
  shippingAddress: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sameAsBilling, setSameAsBilling] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      mobileNo: '',
      email: '',
      companyName: '',
      gst: '',
      billingMainAddress: '',
      billingPincode: '',
      billingCity: '',
      billingState: '',
      billingCountry: 'India',
      shippingAddress: '',
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Failed to create client'
        toast.error(errorMessage)
        throw new Error(errorMessage)
       }

      toast.success('Client created successfully')
      router.push('/clients') // Assuming there's a clients list page
    } catch (error) {
      toast.error('Failed to create client')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }



  const handleFetchPincode = async (pincode: string) => {
    if (!pincode) return

    try {
      const response = await fetch('/api/fetch-pincode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pincode }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pincode details')
      }

      const data = await response.json()

      form.setValue('billingCity', data.city)
      form.setValue('billingState', data.state)
    } catch (error) {
      console.error(error)
      // Don't show error toast for pincode fetch as it's optional
    }
  }

  const handleFetchGST = async (gst: string) => {
    if (!gst) return

    try {
      const response = await fetch('/api/fetch-gst-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gst }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error('Failed to Fetch Details from GST')
        throw new Error(errorData.message || `Failed to fetch GST details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      form.setValue('companyName', data.companyName || '')
      form.setValue('billingMainAddress', data.billingMainAddress || '')
      form.setValue('billingCity', data.city || '')
      form.setValue('billingState', data.state || '')
      form.setValue('billingPincode', data.pincode || '')
    } catch (error) {
      console.error('GST fetch error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to fetch GST details')
    }
  }

  return (
    <SidebarProvider>
      <Side />
      <SidebarInset>
        <Header/>
        <div className="container mx-auto py-8 px-15">
          <div>
            <h1 className="text-2xl font-bold mb-6">Create New Client</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Details</h2>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Client name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact No.</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Company Details</h2>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="GST number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value.length === 15) {
                                  handleFetchGST(e.target.value)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => handleFetchGST(field.value || '')}
                              disabled={!field.value}
                            >
                              Fetch Details
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Address Details</h2>
                  <FormField
                      control={form.control}
                      name="billingMainAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Main address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingPincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Pincode"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                handleFetchPincode(e.target.value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="same-as-billing"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => {
                        setSameAsBilling(checked)








                        if (checked) {
                          const addressParts: string[] = []
                          
                          const mainAddress = form.getValues('billingMainAddress')
                          if (mainAddress && mainAddress.trim()) addressParts.push(mainAddress.trim())
                          
                          const city = form.getValues('billingCity')
                          if (city && city.trim()) addressParts.push(city.trim())
                          
                          const state = form.getValues('billingState')
                          if (state && state.trim()) addressParts.push(state.trim())
                          
                          const pincode = form.getValues('billingPincode')
                          if (pincode && pincode.trim()) addressParts.push(pincode.trim())
                          
                          const country = form.getValues('billingCountry')
                          if (country && country.trim()) addressParts.push(country.trim())
                          
                          form.setValue('shippingAddress', addressParts.join(', '))
                        }
                      }}
                    />
                    <label htmlFor="same-as-billing">Shipping address same as billing</label>
                  </div>
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Shipping address"
                            {...field}
                            disabled={sameAsBilling}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating...' : 'Create Client'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
