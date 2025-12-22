
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import Header from '../_components/Header'
import {
    SidebarInset,
} from "@/components/ui/sidebar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Building, FileSignature, CreditCard, FileText, Loader2, Plus, X, Edit2, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast, Toaster } from "react-hot-toast";
import Side from '../_components/Side';


// Utility function to extract PAN from GST number (characters 3-12)
const extractPanFromGst = (gst: string): string => {
    if (gst && gst.length >= 12) {
        return gst.substring(2, 12) // Extract characters 3-12 (0-indexed: 2-11)
    }
    return ''
}

// Validate GST format
const isValidGstFormat = (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstRegex.test(gst)
}

export default function SettingsPage() {

    const [activeTab, setActiveTab] = useState("company")
    const { orgId } = useAuth()
    const [orgName, setOrgName] = useState<string | null>(null)


    // Company details state
    const [companyDetails, setCompanyDetails] = useState({
        companyName: '',
        orgName: '',
        legalName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst: '',
        pan: '',
        email: '',
        phone: ''
    })

    // Company Details API state
    const [companyDetailsList, setCompanyDetailsList] = useState<any[]>([])
    const [isLoadingCompanyDetails, setIsLoadingCompanyDetails] = useState(false)
    const [isSavingCompanyDetails, setIsSavingCompanyDetails] = useState(false)

    const [isLoadingGST, setIsLoadingGST] = useState(false)


    // Signatures state
    const [signatures, setSignatures] = useState<any[]>([])
    const [isLoadingSignatures, setIsLoadingSignatures] = useState(false)
    const [isAddSignatureOpen, setIsAddSignatureOpen] = useState(false)
    const [editingSignature, setEditingSignature] = useState<any>(null)
    const [newSignature, setNewSignature] = useState({
        name: '',
        imageUrl: '',
        isDefault: false
    })

    // Bank Details state
    const [bankDetails, setBankDetails] = useState<any[]>([])
    const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(false)
    const [isAddBankDetailOpen, setIsAddBankDetailOpen] = useState(false)
    const [editingBankDetail, setEditingBankDetail] = useState<any>(null)
    const [newBankDetail, setNewBankDetail] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        swiftCode: '',
        branchName: '',
        upiId: '',
        isDefault: false
    })


    // Set company name from Clerk organization
    useEffect(() => {
        const fetchOrgName = async () => {
            if (orgId) {
                try {
                    const response = await fetch('/api/auth/upsert')
                    if (response.ok) {
                        const data = await response.json()
                        if (data?.orgName) {
                            setOrgName(data.orgName)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching organization:', error)
                }
            }
        }
        fetchOrgName()
    }, [orgId])

    useEffect(() => {
        if (orgName) {
            setCompanyDetails(prev => ({
                ...prev,
                orgName: orgName
            }))
        }
    }, [orgName])



    // Fetch all data when orgId changes - similar to refreshAllData
    useEffect(() => {
        const fetchAllDataOnOrgChange = async () => {
            if (!orgId) return

            try {
                // Fetch all data in parallel when organization changes
                await Promise.all([
                    fetchCompanyDetails(),
                    fetchSignatures(),
                    fetchBankDetails(),
                    fetchDocumentSettings()
                ])
            } catch (error) {
                console.error('Error fetching data on organization change:', error)
            }
        }

        fetchAllDataOnOrgChange()
    }, [orgId]) // Only depend on orgId - fetch all APIs when org changes

    // Individual fetch functions
    const fetchCompanyDetails = async () => {
        setIsLoadingCompanyDetails(true)
        try {
            const response = await fetch('/api/settings/company-details')
            if (response.ok) {
                const data = await response.json()
                setCompanyDetailsList(data)
                // If there are existing company details, populate the form with the first/default one
                if (data.length > 0) {
                    const defaultDetail = data.find((detail: any) => detail.isDefault) || data[0]
                    setCompanyDetails(prev => ({
                        ...prev,
                        companyName: defaultDetail.companyName || '',
                        orgName: defaultDetail.orgName || orgName || '',
                        legalName: defaultDetail.legalName || '',
                        address: defaultDetail.address || '',
                        city: defaultDetail.city || '',
                        state: defaultDetail.state || '',
                        pincode: defaultDetail.pincode || '',
                        gst: defaultDetail.gst || '',
                        pan: defaultDetail.pan || '',
                        email: defaultDetail.email || '',
                        phone: defaultDetail.phone || ''
                    }))
                }
            } else {
                console.error('Failed to fetch company details')
            }
        } catch (error) {
            console.error('Error fetching company details:', error)
        } finally {
            setIsLoadingCompanyDetails(false)
        }
    }

    const fetchSignatures = async () => {
        setIsLoadingSignatures(true)
        try {
            const response = await fetch('/api/settings/signatures')
            if (response.ok) {
                const data = await response.json()
                setSignatures(data)
            } else {
                console.error('Failed to fetch signatures')
            }
        } catch (error) {
            console.error('Error fetching signatures:', error)
        } finally {
            setIsLoadingSignatures(false)
        }
    }

    const fetchBankDetails = async () => {
        setIsLoadingBankDetails(true)
        try {
            const response = await fetch('/api/settings/bank-details')
            if (response.ok) {
                const data = await response.json()
                setBankDetails(data)
            } else {
                console.error('Failed to fetch bank details')
            }
        } catch (error) {
            console.error('Error fetching bank details:', error)
        } finally {
            setIsLoadingBankDetails(false)
        }
    }

    const fetchDocumentSettings = async () => {
        setIsLoadingDocumentSettings(true)
        try {
            const response = await fetch('/api/settings/document-settings')
            if (response.ok) {
                const data = await response.json()
                setDocumentSettings(data)
            } else {
                console.error('Failed to fetch document settings')
            }
        } catch (error) {
            console.error('Error fetching document settings:', error)
        } finally {
            setIsLoadingDocumentSettings(false)
        }
    }


    const handleInputChange = (field: string, value: string) => {
        setCompanyDetails(prev => {
            const updated = { ...prev, [field]: value }
            
            // Auto-extract PAN from GST when GST field is updated
            if (field === 'gst') {
                const extractedPan = extractPanFromGst(value)
                if (extractedPan && isValidGstFormat(value)) {
                    updated.pan = extractedPan
                }
            }
            
            return updated
        })
    }

    const fetchGSTDetails = async () => {
        if (!companyDetails.gst.trim()) {
            alert('Please enter a GST number first')
            return
        }

        setIsLoadingGST(true)
        try {
            const response = await fetch('/api/fetch-gst-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gst: companyDetails.gst }),
            })

            const data = await response.json()


            if (response.ok) {
                // Extract PAN from GST number
                const extractedPan = extractPanFromGst(companyDetails.gst)
                
                setCompanyDetails(prev => ({
                    ...prev,
                    companyName: data.companyName || prev.companyName,
                    address: data.billingMainAddress || prev.address,
                    city: data.city || prev.city,
                    state: data.state || prev.state,
                    pincode: data.pincode || prev.pincode,
                    pan: prev.pan || extractedPan // Use existing PAN or extracted PAN
                }))
            } else {
                alert(data.error || 'Failed to fetch GST details')
            }
        } catch (error) {
            console.error('Error fetching GST details:', error)
            alert('Failed to fetch GST details. Please try again.')

        } finally {
            setIsLoadingGST(false)
        }
    }




    // Document settings constants
    const documentTypes = [
        { value: 'invoice', label: 'Invoice' },
        { value: 'delivery_challan', label: 'Delivery Challan' },
        { value: 'proforma_invoice', label: 'Proforma Invoice' },
        { value: 'shipping_label', label: 'Shipping Label' },
        { value: 'quotation', label: 'Quotation' },
        { value: 'estimate', label: 'Estimate' }
    ]

    const pageSizeOptions = [
        { value: 'A4', label: 'A4' },
        { value: 'A3', label: 'A3' },
        { value: 'A5', label: 'A5' },
        { value: 'Letter', label: 'Letter' },
        { value: 'Legal', label: 'Legal' }
    ]


    // Document settings state
    const [documentSettings, setDocumentSettings] = useState<any[]>([])
    const [isLoadingDocumentSettings, setIsLoadingDocumentSettings] = useState(false)
    const [activeDocumentTab, setActiveDocumentTab] = useState('invoice')


    // Global refresh state
    const [isRefreshingAll, setIsRefreshingAll] = useState(false)

    // Global refresh function - calls all APIs
    const refreshAllData = async () => {
        if (!orgId || !orgName) return

        setIsRefreshingAll(true)
        try {
            // Fetch all data in parallel
            await Promise.all([
                fetchCompanyDetails(),
                fetchSignatures(),
                fetchBankDetails(),
                fetchDocumentSettings()
            ])
            toast.success('All data refreshed successfully')
        } catch (error) {
            console.error('Error refreshing data:', error)
            toast.error('Some data failed to refresh')
        } finally {
            setIsRefreshingAll(false)
        }
    }

    const handleSaveSignature = async () => {
        if (!newSignature.name.trim() || !newSignature.imageUrl.trim()) {
            toast.error('Please fill in all required fields')
            return
        }


        try {
            const response = await fetch('/api/settings/signatures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSignature),
            })

            if (response.ok) {
                const savedSignature = await response.json()
                setSignatures(prev => [...prev, savedSignature])
                setNewSignature({ name: '', imageUrl: '', isDefault: false })
                setIsAddSignatureOpen(false)
                toast.success('Signature created successfully')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to create signature')
            }
        } catch (error) {
            console.error('Error creating signature:', error)
            toast.error('Failed to create signature')
        }
    }

    const handleDeleteSignature = async (id: string) => {

        try {
            const response = await fetch(`/api/settings/signatures?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setSignatures(prev => prev.filter(sig => sig.id !== id))
                toast.success('Signature deleted successfully')
            } else {
                toast.error('Failed to delete signature')
            }
        } catch (error) {
            console.error('Error deleting signature:', error)
            toast.error('Failed to delete signature')
        }
    }



    const handleSetDefault = async (id: string, isDefault: boolean) => {
        try {
            const response = await fetch('/api/settings/signatures', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, isDefault }),
            })

            if (response.ok) {
                const updatedSignature = await response.json()
                setSignatures(prev => prev.map(sig => 
                    sig.id === id 
                        ? updatedSignature 
                        : { ...sig, isDefault: false }
                ))
                toast.success(isDefault ? 'Default signature set' : 'Default removed')
            } else {
                toast.error('Failed to update default signature')
            }
        } catch (error) {
            console.error('Error updating default signature:', error)
            toast.error('Failed to update default signature')
        }
    }

    // Bank Details Handlers

    const handleSaveBankDetail = async () => {
        if (!newBankDetail.accountHolderName.trim() || !newBankDetail.bankName.trim() || !newBankDetail.accountNumber.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const response = await fetch('/api/settings/bank-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBankDetail),
            })

            if (response.ok) {
                const savedBankDetail = await response.json()
                setBankDetails(prev => [...prev, savedBankDetail])
                setNewBankDetail({
                    accountHolderName: '',
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    swiftCode: '',
                    branchName: '',
                    upiId: '',
                    isDefault: false
                })
                setIsAddBankDetailOpen(false)
                toast.success('Bank detail created successfully')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to create bank detail')
            }
        } catch (error) {
            console.error('Error creating bank detail:', error)
            toast.error('Failed to create bank detail')
        }
    }

    // Company Details Save Handler
    const handleSaveCompanyDetails = async () => {
        if (!companyDetails.companyName.trim()) {
            toast.error('Company name is required')
            return
        }

        setIsSavingCompanyDetails(true)
        try {
            const existingDetail = companyDetailsList.find(detail => detail.isDefault) || companyDetailsList[0]

            if (existingDetail) {
                // Update existing company detail
                const response = await fetch('/api/settings/company-details', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: existingDetail.id,
                        ...companyDetails,
                        isDefault: true
                    }),
                })

                if (response.ok) {
                    const updatedDetail = await response.json()
                    setCompanyDetailsList(prev => prev.map(detail => 
                        detail.id === existingDetail.id ? updatedDetail : { ...detail, isDefault: false }
                    ))
                    toast.success('Company details updated successfully')
                } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to update company details')
                }
            } else {
                // Create new company detail
                const response = await fetch('/api/settings/company-details', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...companyDetails,
                        isDefault: true
                    }),
                })

                if (response.ok) {
                    const newDetail = await response.json()
                    setCompanyDetailsList([newDetail])
                    toast.success('Company details saved successfully')
                } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to save company details')
                }
            }
        } catch (error) {
            console.error('Error saving company details:', error)
            toast.error('Failed to save company details')
        } finally {
            setIsSavingCompanyDetails(false)
        }
    }

    const handleDeleteBankDetail = async (id: string) => {
        try {
            const response = await fetch(`/api/settings/bank-details?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setBankDetails(prev => prev.filter(bank => bank.id !== id))
                toast.success('Bank detail deleted successfully')
            } else {
                toast.error('Failed to delete bank detail')
            }
        } catch (error) {
            console.error('Error deleting bank detail:', error)
            toast.error('Failed to delete bank detail')
        }
    }


    const handleSetDefaultBank = async (id: string, isDefault: boolean) => {
        try {
            const response = await fetch('/api/settings/bank-details', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, isDefault }),
            })

            if (response.ok) {
                const updatedBankDetail = await response.json()
                setBankDetails(prev => prev.map(bank => 
                    bank.id === id 
                        ? updatedBankDetail 
                        : { ...bank, isDefault: false }
                ))
                toast.success(isDefault ? 'Default bank account set' : 'Default removed')
            } else {
                toast.error('Failed to update default bank account')
            }
        } catch (error) {
            console.error('Error updating default bank account:', error)
            toast.error('Failed to update default bank account')
        }
    }


    // Document Settings Handlers
    const getDocumentSetting = (documentType: string) => {
        return documentSettings.find(setting => setting.documentType === documentType)
    }

    // Create separate form states for each document type
    const [documentFormData, setDocumentFormData] = useState<{[key: string]: any}>({})

    // Initialize form data when document settings are loaded
    useEffect(() => {
        const formData: {[key: string]: any} = {}
        documentTypes.forEach(docType => {
            const setting = getDocumentSetting(docType.value)
            formData[docType.value] = {
                prefix: setting?.prefix || '',
                nextNumber: setting?.nextNumber || '1',
                showQrCode: setting?.showQrCode || false,
                pageSize: setting?.pageSize || 'A4',
                termsConditions: setting?.termsConditions || '',
                notes: setting?.notes || ''
            }
        })
        setDocumentFormData(formData)
    }, [documentSettings])

    const handleDocumentFormChange = (documentType: string, field: string, value: any) => {
        setDocumentFormData(prev => ({
            ...prev,
            [documentType]: {
                ...prev[documentType],
                [field]: value
            }
        }))
    }

    const handleSaveDocumentSetting = async (documentType: string, data: any) => {
        const existingSetting = getDocumentSetting(documentType)
        
        if (existingSetting) {
            // Update existing setting
            try {
                const response = await fetch('/api/settings/document-settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: existingSetting.id,
                        ...data,
                        documentType
                    }),
                })

                if (response.ok) {
                    const updatedSetting = await response.json()
                    setDocumentSettings(prev => prev.map(setting => 
                        setting.id === existingSetting.id ? updatedSetting : setting
                    ))
                    toast.success(`${documentTypes.find(dt => dt.value === documentType)?.label} settings updated successfully`)
                } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to update document settings')
                }
            } catch (error) {
                console.error('Error updating document setting:', error)
                toast.error('Failed to update document settings')
            }
        } else {
            // Create new setting
            try {
                const response = await fetch('/api/settings/document-settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...data,
                        documentType
                    }),
                })

                if (response.ok) {
                    const newSetting = await response.json()
                    setDocumentSettings(prev => [...prev, newSetting])
                    toast.success(`${documentTypes.find(dt => dt.value === documentType)?.label} settings saved successfully`)
                } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to save document settings')
                }
            } catch (error) {
                console.error('Error creating document setting:', error)
                toast.error('Failed to save document settings')
            }
        }
    }

    return (
        <>  
            <Toaster position='bottom-right'/>
            <Side/>
            <section className='w-full'>
                <Side/>
                <SidebarInset>
                    <Header />

                    <main className="flex-1 px-15 py-5 w-full">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Settings</h1>
                                <p className="text-muted-foreground">Manage your business settings and preferences</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={refreshAllData}
                                disabled={isRefreshingAll}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                                Refresh All
                            </Button>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="company" className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Company Details
                                </TabsTrigger>
                                <TabsTrigger value="signatures" className="flex items-center gap-2">
                                    <FileSignature className="w-4 h-4" />
                                    Signatures
                                </TabsTrigger>
                                <TabsTrigger value="bank" className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Bank Details
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Document Settings
                                </TabsTrigger>
                            </TabsList>



                            {/* Company Details Tab */}
                            <TabsContent value="company" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="w-5 h-5" />
                                            Company Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your company details for invoices and documents
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="space-y-2">
                                                <Label htmlFor="companyName">Company Name</Label>
                                                <Input
                                                    id="companyName"
                                                    placeholder="Enter company name"
                                                    value={companyDetails.companyName}
                                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="legalName">Legal Name</Label>
                                                <Input
                                                    id="legalName"
                                                    placeholder="Enter legal name"
                                                    value={companyDetails.legalName}
                                                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                id="address"
                                                placeholder="Enter company address"
                                                rows={3}
                                                value={companyDetails.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    placeholder="Enter city"
                                                    value={companyDetails.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    placeholder="Enter state"
                                                    value={companyDetails.state}
                                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Pincode</Label>
                                                <Input
                                                    id="pincode"
                                                    placeholder="Enter pincode"
                                                    value={companyDetails.pincode}
                                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gst">GST Number</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="gst"
                                                        placeholder="Enter GST number"
                                                        value={companyDetails.gst}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            handleInputChange('gst', value)
                                                            if (value.length === 15) {
                                                                fetchGSTDetails()
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={fetchGSTDetails}
                                                        disabled={isLoadingGST}
                                                        className="whitespace-nowrap"
                                                    >
                                                        {isLoadingGST ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Fetching...
                                                            </>
                                                        ) : (
                                                            'Fetch Details'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pan">PAN Number</Label>
                                                <Input
                                                    id="pan"
                                                    placeholder="Enter PAN number"
                                                    value={companyDetails.pan}
                                                    onChange={(e) => handleInputChange('pan', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter email"
                                                    value={companyDetails.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="Enter phone number"
                                                    value={companyDetails.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                />
                                            </div>
                                        </div>


                                        <Button 
                                            className="w-full md:w-auto"
                                            onClick={handleSaveCompanyDetails}
                                            disabled={isSavingCompanyDetails}
                                        >
                                            {isSavingCompanyDetails ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Company Details
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>


                            {/* Signatures Tab */}
                            <TabsContent value="signatures" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileSignature className="w-5 h-5" />
                                            Digital Signatures
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your digital signatures for documents
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Add New Signature Button */}
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Your Signatures</h3>
                                            <Dialog open={isAddSignatureOpen} onOpenChange={setIsAddSignatureOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="flex items-center gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add New Signature
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Signature</DialogTitle>
                                                        <DialogDescription>
                                                            Create a new digital signature with a name and image URL.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="signatureName">Signature Name</Label>
                                                            <Input
                                                                id="signatureName"
                                                                placeholder="Enter signature name"
                                                                value={newSignature.name}
                                                                onChange={(e) => setNewSignature(prev => ({ ...prev, name: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="imageUrl">Image URL</Label>
                                                            <Input
                                                                id="imageUrl"
                                                                placeholder="https://example.com/signature.png"
                                                                value={newSignature.imageUrl}
                                                                onChange={(e) => setNewSignature(prev => ({ ...prev, imageUrl: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="isDefault"
                                                                checked={newSignature.isDefault}
                                                                onCheckedChange={(checked) => setNewSignature(prev => ({ ...prev, isDefault: checked }))}
                                                            />
                                                            <Label htmlFor="isDefault">Set as default signature</Label>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsAddSignatureOpen(false)
                                                                setNewSignature({ name: '', imageUrl: '', isDefault: false })
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleSaveSignature}>
                                                            Save Signature
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Signatures List */}
                                        {isLoadingSignatures ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            </div>
                                        ) : signatures.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileSignature className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>No signatures found</p>
                                                <p className="text-sm">Click "Add New Signature" to get started</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {signatures.map((signature) => (
                                                    <Card key={signature.id} className="relative">
                                                        <CardContent className="p-4">
                                                            {/* Default Badge */}
                                                            {signature.isDefault && (
                                                                <div className="absolute top-2 right-2">
                                                                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                        Default
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Signature Image */}
                                                            <div className="mb-3">
                                                                {signature.imageUrl ? (
                                                                    <img
                                                                        src={signature.imageUrl}
                                                                        alt={signature.name}
                                                                        className="w-full h-24 object-contain border rounded"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-24 border rounded flex items-center justify-center bg-gray-50">
                                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Signature Info */}
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm">{signature.name}</h4>
                                                                
                                                                {/* Default Switch */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch
                                                                            id={`default-${signature.id}`}
                                                                            checked={signature.isDefault}
                                                                            onCheckedChange={(checked) => handleSetDefault(signature.id, checked)}
                                                                        />
                                                                        <Label htmlFor={`default-${signature.id}`} className="text-xs">
                                                                            Default
                                                                        </Label>
                                                                    </div>
                                                                    
                                                                    {/* Delete Button */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteSignature(signature.id)}
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>


                            {/* Bank Details Tab */}
                            <TabsContent value="bank" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Bank Account Details
                                        </CardTitle>
                                        <CardDescription>
                                            Configure bank account information for payments and invoices
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Add New Bank Detail Button */}
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Your Bank Accounts</h3>
                                            <Dialog open={isAddBankDetailOpen} onOpenChange={setIsAddBankDetailOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="flex items-center gap-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add Bank Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Add Bank Account</DialogTitle>
                                                        <DialogDescription>
                                                            Add a new bank account with all necessary details.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                                            <Input
                                                                id="accountHolderName"
                                                                placeholder="Enter account holder name"
                                                                value={newBankDetail.accountHolderName}
                                                                onChange={(e) => setNewBankDetail(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="bankName">Bank Name *</Label>
                                                            <Input
                                                                id="bankName"
                                                                placeholder="Enter bank name"
                                                                value={newBankDetail.bankName}
                                                                onChange={(e) => setNewBankDetail(prev => ({ ...prev, bankName: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="accountNumber">Account Number *</Label>
                                                            <Input
                                                                id="accountNumber"
                                                                placeholder="Enter account number"
                                                                value={newBankDetail.accountNumber}
                                                                onChange={(e) => setNewBankDetail(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="ifscCode">IFSC Code</Label>
                                                                <Input
                                                                    id="ifscCode"
                                                                    placeholder="ABCD0123456"
                                                                    value={newBankDetail.ifscCode}
                                                                    onChange={(e) => setNewBankDetail(prev => ({ ...prev, ifscCode: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="swiftCode">SWIFT Code</Label>
                                                                <Input
                                                                    id="swiftCode"
                                                                    placeholder="ABCDUS33"
                                                                    value={newBankDetail.swiftCode}
                                                                    onChange={(e) => setNewBankDetail(prev => ({ ...prev, swiftCode: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="branchName">Branch Name</Label>
                                                            <Input
                                                                id="branchName"
                                                                placeholder="Enter branch name"
                                                                value={newBankDetail.branchName}
                                                                onChange={(e) => setNewBankDetail(prev => ({ ...prev, branchName: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="upiId">UPI ID</Label>
                                                            <Input
                                                                id="upiId"
                                                                placeholder="username@bank"
                                                                value={newBankDetail.upiId}
                                                                onChange={(e) => setNewBankDetail(prev => ({ ...prev, upiId: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="isDefault"
                                                                checked={newBankDetail.isDefault}
                                                                onCheckedChange={(checked) => setNewBankDetail(prev => ({ ...prev, isDefault: checked }))}
                                                            />
                                                            <Label htmlFor="isDefault">Set as default bank account</Label>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsAddBankDetailOpen(false)
                                                                setNewBankDetail({
                                                                    accountHolderName: '',
                                                                    bankName: '',
                                                                    accountNumber: '',
                                                                    ifscCode: '',
                                                                    swiftCode: '',
                                                                    branchName: '',
                                                                    upiId: '',
                                                                    isDefault: false
                                                                })
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleSaveBankDetail}>
                                                            Save Bank Account
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Bank Details List */}
                                        {isLoadingBankDetails ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            </div>
                                        ) : bankDetails.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>No bank accounts found</p>
                                                <p className="text-sm">Click "Add Bank Account" to get started</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {bankDetails.map((bank) => (
                                                    <Card key={bank.id} className="relative">
                                                        <CardContent className="p-4">
                                                            {/* Default Badge */}
                                                            {bank.isDefault && (
                                                                <div className="absolute top-2 right-2">
                                                                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                        Default
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Bank Details Info */}
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h4 className="font-medium text-sm">{bank.accountHolderName}</h4>
                                                                    <p className="text-xs text-gray-600">{bank.bankName}</p>
                                                                </div>

                                                                <div className="space-y-1 text-xs">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Account:</span>
                                                                        <span className="font-mono">{bank.accountNumber}</span>
                                                                    </div>
                                                                    {bank.ifscCode && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">IFSC:</span>
                                                                            <span className="font-mono">{bank.ifscCode}</span>
                                                                        </div>
                                                                    )}
                                                                    {bank.branchName && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">Branch:</span>
                                                                            <span>{bank.branchName}</span>
                                                                        </div>
                                                                    )}
                                                                    {bank.upiId && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-500">UPI:</span>
                                                                            <span className="font-mono text-xs">{bank.upiId}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Default Switch and Delete Button */}
                                                                <div className="flex items-center justify-between pt-2 border-t">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch
                                                                            id={`default-bank-${bank.id}`}
                                                                            checked={bank.isDefault}
                                                                            onCheckedChange={(checked) => handleSetDefaultBank(bank.id, checked)}
                                                                        />
                                                                        <Label htmlFor={`default-bank-${bank.id}`} className="text-xs">
                                                                            Default
                                                                        </Label>
                                                                    </div>
                                                                    
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteBankDetail(bank.id)}
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>


                            {/* Document Settings Tab */}
                            <TabsContent value="documents" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Document Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Configure document templates, numbering, and formatting for all document types
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {isLoadingDocumentSettings ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            </div>
                                        ) : (
                                            <Tabs value={activeDocumentTab} onValueChange={setActiveDocumentTab} className="space-y-6">
                                                <TabsList className="grid w-full grid-cols-6">
                                                    {documentTypes.map((docType) => (
                                                        <TabsTrigger key={docType.value} value={docType.value} className="text-xs">
                                                            {docType.label}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>


                                                {documentTypes.map((docType) => {
                                                    const formData = documentFormData[docType.value] || {
                                                        prefix: '',
                                                        nextNumber: '1',
                                                        showQrCode: false,
                                                        pageSize: 'A4',
                                                        termsConditions: '',
                                                        notes: ''
                                                    }

                                                    const handleSave = () => {
                                                        handleSaveDocumentSetting(docType.value, formData)
                                                    }

                                                    return (
                                                        <TabsContent key={docType.value} value={docType.value} className="space-y-6">
                                                            <Card>
                                                                <CardHeader>
                                                                    <CardTitle className="flex items-center gap-2">
                                                                        <FileText className="w-5 h-5" />
                                                                        {docType.label} Settings
                                                                    </CardTitle>
                                                                    <CardDescription>
                                                                        Configure {docType.label.toLowerCase()} template and formatting options
                                                                    </CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor={`${docType.value}-prefix`}>Prefix</Label>
                                                                            <Input
                                                                                id={`${docType.value}-prefix`}
                                                                                placeholder={`Enter ${docType.label.toLowerCase()} prefix`}

                                                                                value={formData.prefix}
                                                                                onChange={(e) => handleDocumentFormChange(docType.value, 'prefix', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor={`${docType.value}-next-number`}>Next {docType.label} No.</Label>
                                                                            <Input
                                                                                id={`${docType.value}-next-number`}
                                                                                type="number"
                                                                                placeholder="1"

                                                                                value={formData.nextNumber}
                                                                                onChange={(e) => handleDocumentFormChange(docType.value, 'nextNumber', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor={`${docType.value}-page-size`}>Page Size</Label>

                                                                            <Select
                                                                                value={formData.pageSize}
                                                                                onValueChange={(value) => handleDocumentFormChange(docType.value, 'pageSize', value)}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select page size" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {pageSizeOptions.map((size) => (
                                                                                        <SelectItem key={size.value} value={size.value}>
                                                                                            {size.label}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center space-x-2 pt-6">

                                                                                <Switch
                                                                                    id={`${docType.value}-show-qr`}
                                                                                    checked={formData.showQrCode}
                                                                                    onCheckedChange={(checked) => handleDocumentFormChange(docType.value, 'showQrCode', checked)}
                                                                                />
                                                                                <Label htmlFor={`${docType.value}-show-qr`}>
                                                                                    Show QR Code for payment
                                                                                </Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`${docType.value}-terms`}>Terms & Conditions</Label>

                                                                        <Textarea
                                                                            id={`${docType.value}-terms`}
                                                                            placeholder={`Enter ${docType.label.toLowerCase()} terms and conditions`}
                                                                            rows={3}
                                                                            value={formData.termsConditions}
                                                                            onChange={(e) => handleDocumentFormChange(docType.value, 'termsConditions', e.target.value)}
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`${docType.value}-notes`}>Notes</Label>

                                                                        <Textarea
                                                                            id={`${docType.value}-notes`}
                                                                            placeholder={`Enter ${docType.label.toLowerCase()} notes`}
                                                                            rows={2}
                                                                            value={formData.notes}
                                                                            onChange={(e) => handleDocumentFormChange(docType.value, 'notes', e.target.value)}
                                                                        />
                                                                    </div>

                                                                    <Button onClick={handleSave} className="w-full md:w-auto">
                                                                        <Save className="w-4 h-4 mr-2" />
                                                                        Save {docType.label} Settings
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </TabsContent>
                                                    )
                                                })}
                                            </Tabs>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </SidebarInset>
            </section>
        </>
    )
}
