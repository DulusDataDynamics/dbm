'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Building,
  Users,
  CreditCard,
  Palette,
  Puzzle,
  Database,
  ShieldCheck,
  LifeBuoy,
  Code,
  FileText,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getBusinessProfile, saveBusinessProfile, saveInvoiceSettings, getInvoiceSettings } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import DownloadInvoices from '@/components/app/download-invoices';
import { getFirebase, waitForFirebaseReady } from '@/lib/firebaseClient';
import type { Firestore } from 'firebase/firestore';


const settingsSections = [
  { value: 'profile', label: 'Business Profile', icon: Building, content: 'Manage your business details and branding.' },
  { value: 'invoicing', label: 'Invoicing', icon: FileText, content: 'Customize your invoice settings and appearance.' },
  { value: 'team', label: 'Team & Roles', icon: Users, content: 'Control who has access and what they can do.' },
  { value: 'billing', label: 'Billing & Subscription', icon: CreditCard, content: 'Manage your subscription plan and payment methods.' },
  { value: 'preferences', label: 'App Preferences', icon: Palette, content: 'Personalize how the app looks and works.' },
  { value: 'integrations', label: 'Integrations', icon: Puzzle, content: 'Connect to other tools and services.' },
  { value: 'data', label: 'Reports & Data', icon: Database, content: 'Handle data safely with import/export options.' },
  { value: 'security', label: 'Security & Access', icon: ShieldCheck, content: 'Protect your account with advanced security settings.' },
  { value: 'support', label: 'Support & Feedback', icon: LifeBuoy, content: 'Get help and provide feedback.' },
  { value: 'developer', label: 'Developer', icon: Code, content: 'Access developer tools and API settings.' },
];

const profileSchema = z.object({
    companyName: z.string().optional(),
    ownerName: z.string().optional(),
    businessEmail: z.string().email().optional().or(z.literal('')),
    businessPhone: z.string().optional(),
    businessAddress: z.string().optional(),
    website: z.string().optional(),
    taxNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    branchCode: z.string().optional(),
    defaultCurrency: z.string().optional(),
    defaultTaxRate: z.coerce.number().optional(),
});

const invoiceSettingsSchema = z.object({
    brandColor: z.string().optional(),
    invoiceContactName: z.string().optional(),
    invoiceContactEmail: z.string().email().optional().or(z.literal('')),
    invoiceContactPhone: z.string().optional(),
    invoicePrefix: z.string().optional(),
    defaultDueDays: z.coerce.number().optional(),
    paymentTerms: z.string().optional(),
    footerMessage: z.string().optional(),
    showWatermark: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;

const comingSoonSections = ['team', 'billing', 'integrations', 'developer'];

export default function SettingsPage() {
  const { user, logout, auth } = useAuth();
  const [db, setDb] = useState<Firestore | null>(null);
  const { toast } = useToast();
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const [profileSaveState, setProfileSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [invoiceSaveState, setInvoiceSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      ownerName: '',
      businessEmail: '',
      businessPhone: '',
      businessAddress: '',
      website: '',
      taxNumber: '',
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      branchCode: '',
      defaultCurrency: 'ZAR',
      defaultTaxRate: 15,
    }
  });

  const invoiceForm = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
     defaultValues: {
        brandColor: '#2B579A',
        invoiceContactName: '',
        invoiceContactEmail: '',
        invoiceContactPhone: '',
        invoicePrefix: 'INV-',
        defaultDueDays: 30,
        paymentTerms: 'Payment due within 30 days.',
        footerMessage: 'Thank you for your business!',
        showWatermark: true,
     }
  });

  useEffect(() => {
    if (!auth) return;
    async function loadFirebase() {
      await waitForFirebaseReady(auth);
      const fb = getFirebase();
      if (fb) {
        setDb(fb.db);
        if (user?.uid) {
          getBusinessProfile(fb.db, user.uid).then(profile => {
            if (profile) {
              profileForm.reset(profile);
            }
          });
          getInvoiceSettings(fb.db, user.uid).then(settings => {
            if(settings) {
                invoiceForm.reset(settings);
            }
          });
        }
      }
    }
    loadFirebase();
  }, [auth, user, profileForm, invoiceForm]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user?.uid || !db) return;
    setProfileSaveState('saving');
    await saveBusinessProfile(db, user.uid, data);
    toast({ title: 'Business profile saved successfully!' });
    setProfileSaveState('saved');
    setTimeout(() => setProfileSaveState('idle'), 2000);
  };
  
  const onInvoiceSubmit = async (data: InvoiceSettingsFormValues) => {
    if (!user?.uid || !db) return;
    setInvoiceSaveState('saving');
    await saveInvoiceSettings(db, user.uid, data);
    toast({ title: 'Invoice settings saved successfully!' });
    setInvoiceSaveState('saved');
    setTimeout(() => setInvoiceSaveState('idle'), 2000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, company, and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col gap-6 md:flex-row" orientation="vertical">
        <TabsList className="flex h-full flex-shrink-0 flex-row justify-start overflow-x-auto p-1 md:flex-col md:overflow-x-visible">
          {settingsSections.map((section) => (
            <TabsTrigger
              key={section.value}
              value={section.value}
              className="w-full justify-start gap-2 whitespace-nowrap px-3 py-2 text-left"
            >
              <section.icon className="h-4 w-4" />
              <span>{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="w-full">
            <TabsContent value="profile" className="mt-0">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <Card>
                      <CardHeader>
                          <CardTitle>Business Profile</CardTitle>
                          <CardDescription>This information will automatically appear on all your invoices.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Business Information</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={profileForm.control} name="companyName" render={({ field }) => (
                                    <FormItem><FormLabel>Business / Company Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="ownerName" render={({ field }) => (
                                    <FormItem><FormLabel>Owner / Contact Person</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="businessEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Business Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl></FormItem>
                                )}/>
                                 <FormField control={profileForm.control} name="businessPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Business Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl></FormItem>
                                )}/>
                            </div>
                            <FormField control={profileForm.control} name="businessAddress" render={({ field }) => (
                                <FormItem><FormLabel>Business Address</FormLabel><FormControl><Input placeholder="Street, City, Postal Code, Country" {...field} /></FormControl></FormItem>
                            )}/>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                               <FormField control={profileForm.control} name="website" render={({ field }) => (
                                    <FormItem><FormLabel>Website (optional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                           <h3 className="text-lg font-medium">Financial & Legal Information</h3>
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                               <FormField control={profileForm.control} name="taxNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Tax / VAT Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="bankName" render={({ field }) => (
                                    <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="accountHolder" render={({ field }) => (
                                    <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="accountNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="branchCode" render={({ field }) => (
                                    <FormItem><FormLabel>Branch Code / SWIFT Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={profileForm.control} name="defaultCurrency" render={({ field }) => (
                                    <FormItem><FormLabel>Default Currency</FormLabel><FormControl><Input placeholder="e.g. ZAR, USD" {...field} /></FormControl></FormItem>
                                )}/>
                                 <FormField control={profileForm.control} name="defaultTaxRate" render={({ field }) => (
                                    <FormItem><FormLabel>Default Tax Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g. 15" {...field} /></FormControl></FormItem>
                                )}/>
                           </div>
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end">
                          <Button type="submit" disabled={!db || profileSaveState === 'saving' || profileSaveState === 'saved'}>
                            {profileSaveState === 'saving' && 'Saving...'}
                            {profileSaveState === 'saved' && <><Check className="mr-2 h-4 w-4" /> Saved!</>}
                            {profileSaveState === 'idle' && 'Save Business Profile'}
                          </Button>
                      </CardFooter>
                    </Card>
                </form>
              </Form>
            </TabsContent>

             <TabsContent value="invoicing" className="mt-0">
                <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)}>
                    <Card>
                    <CardHeader>
                        <CardTitle>Invoicing Settings</CardTitle>
                        <CardDescription>Customize the appearance and default settings for your invoices.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Branding</h3>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 rounded-md">
                                    {companyLogoPreview ? (
                                    <AvatarImage src={companyLogoPreview} alt="Company Logo" className="object-contain" />
                                    ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-md border bg-muted">
                                        <Building className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    )}
                                </Avatar>
                                <div className="space-y-2">
                                    <Label htmlFor="company-logo">Company Logo</Label>
                                    <Input id="company-logo" type="file" className="max-w-sm" onChange={(e) => handleFileChange(e, setCompanyLogoPreview)} accept="image/*" />
                                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG. Recommended: 200x80px.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-md border flex items-center justify-center bg-muted">
                                    {signaturePreview ? (
                                    <img src={signaturePreview} alt="Signature" className="object-contain h-full w-full" />
                                    ) : (
                                    <p className="text-xs text-muted-foreground">Signature</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signature-image">Signature Image (optional)</Label>
                                    <Input id="signature-image" type="file" className="max-w-sm" onChange={(e) => handleFileChange(e, setSignaturePreview)} accept="image/png, image/jpeg" />
                                    <p className="text-xs text-muted-foreground">Upload a transparent PNG for best results.</p>
                                </div>
                            </div>
                            <FormField control={invoiceForm.control} name="brandColor" render={({ field }) => (
                                <FormItem className="max-w-xs"><FormLabel>Brand Color</FormLabel><FormControl>
                                <div className="relative">
                                    <Input {...field} className="pr-10" />
                                    <Controller
                                        control={invoiceForm.control}
                                        name="brandColor"
                                        render={({ field: { onChange, value } }) => (
                                            <input type="color" value={value} onChange={onChange} className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 cursor-pointer appearance-none border-none bg-transparent p-0" />
                                        )}
                                    />
                                </div>
                                </FormControl></FormItem>
                            )}/>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Invoice Contact Details</h3>
                            <p className="text-sm text-muted-foreground">Displayed at the bottom of each invoice for client queries.</p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={invoiceForm.control} name="invoiceContactName" render={({ field }) => (
                                    <FormItem><FormLabel>Contact Person Name</FormLabel><FormControl><Input placeholder="e.g. Accounts Department" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={invoiceForm.control} name="invoiceContactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g. accounts@dulus.com" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={invoiceForm.control} name="invoiceContactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Contact Phone Number</FormLabel><FormControl><Input type="tel" placeholder="e.g. 0800 123 4567" {...field} /></FormControl></FormItem>
                                )}/>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Invoice Generation</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={invoiceForm.control} name="invoicePrefix" render={({ field }) => (
                                    <FormItem><FormLabel>Invoice Number Prefix</FormLabel><FormControl><Input placeholder="e.g. INV-" {...field} /></FormControl></FormItem>
                                )}/>
                                <FormField control={invoiceForm.control} name="defaultDueDays" render={({ field }) => (
                                    <FormItem><FormLabel>Default Due Days</FormLabel><FormControl><Input type="number" placeholder="e.g. 30" {...field} /></FormControl></FormItem>
                                )}/>
                            </div>
                            <FormField control={invoiceForm.control} name="paymentTerms" render={({ field }) => (
                                <FormItem><FormLabel>Default Payment Terms</FormLabel><FormControl><Textarea placeholder="e.g. Payment due within 30 days." {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={invoiceForm.control} name="footerMessage" render={({ field }) => (
                                <FormItem><FormLabel>Footer Message</FormLabel><FormControl><Textarea placeholder="e.g. Thank you for your business!" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={invoiceForm.control} name="showWatermark" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                    <FormLabel>Show DBM Watermark</FormLabel>
                                    <p className="text-xs text-muted-foreground">Display "Generated by Dulus Business Manager" on invoices.</p>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                             )}/>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button type="submit" disabled={!db || invoiceSaveState === 'saving' || invoiceSaveState === 'saved'}>
                          {invoiceSaveState === 'saving' && 'Saving...'}
                          {invoiceSaveState === 'saved' && <><Check className="mr-2 h-4 w-4" /> Saved!</>}
                          {invoiceSaveState === 'idle' && 'Save Invoice Settings'}
                        </Button>
                    </CardFooter>
                    </Card>
                </form>
                </Form>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>App Preferences</CardTitle>
                        <CardDescription>Personalize how the app looks and works for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">Select the appearance of the application.</p>
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <Button variant="outline" className="flex-col h-24" onClick={() => setTheme('light')}>
                                <Sun className="mb-2"/>
                                Light
                            </Button>
                            <Button variant="outline" className="flex-col h-24" onClick={() => setTheme('dark')}>
                                <Moon className="mb-2"/>
                                Dark
                            </Button>
                            <Button variant="outline" className="flex-col h-24" onClick={() => setTheme('system')}>
                                <Laptop className="mb-2"/>
                                System
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Reports & Data</CardTitle>
                        <CardDescription>Manage and export your business data.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="rounded-lg border p-4">
                             <h3 className="font-medium mb-2">Export Invoices</h3>
                             <p className="text-sm text-muted-foreground mb-4">Download a PDF summary of all your invoices.</p>
                            <DownloadInvoices />
                        </div>
                       <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
                            <p className="text-muted-foreground">Advanced reporting and data import/export features are coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Security & Access</CardTitle>
                        <CardDescription>Manage your account security and sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2 rounded-lg border p-4">
                            <h3 className="font-medium">Account Information</h3>
                            <p className="text-sm text-muted-foreground">
                                You are currently logged in as: <strong className="text-foreground">{user?.email}</strong>
                            </p>
                            <Button variant="destructive" onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4"/>
                                Log Out
                            </Button>
                        </div>
                        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
                            <p className="text-muted-foreground">Advanced security features like two-factor authentication (2FA) will be available here soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Support & Feedback</CardTitle>
                        <CardDescription>Get help and provide feedback to improve the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">For assistance, feature requests, or to report a bug, please contact our support team. We're here to help you get the most out of Dulus Business Manager.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild className="w-full sm:w-auto">
                                <Link href="mailto:dulusdatadynamics@gmail.com">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contact via Email
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link href="https://wa.me/27736461288" target="_blank">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Chat on WhatsApp
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {comingSoonSections.map((sectionName) => {
              const section = settingsSections.find(s => s.value === sectionName);
              if (!section) return null;
              return (
              <TabsContent key={section.value} value={section.value} className="mt-0">
                  <Card>
                  <CardHeader>
                      <CardTitle>{section.label}</CardTitle>
                      <CardDescription>{section.content}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
                          <p className="text-muted-foreground">{section.label} settings will be available here soon.</p>
                      </div>
                  </CardContent>
                  </Card>
              </TabsContent>
            )})}
        </div>
      </Tabs>
    </div>
  );
}
