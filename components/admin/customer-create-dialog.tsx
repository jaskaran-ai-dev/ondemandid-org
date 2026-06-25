'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRY_CODES } from '@/lib/country-codes';
import { useAdminCreateCustomer } from '@/hooks/use-admin-customers';

export function CustomerCreateDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useAdminCreateCustomer();
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    initialUsers: '1',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (formData.contactName.length < 2) {
      newErrors.contactName = 'Contact name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{6,14}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 6–14 digits';
    }

    const initialUsersNum = parseInt(formData.initialUsers, 10);
    if (Number.isNaN(initialUsersNum) || initialUsersNum < 1) {
      newErrors.initialUsers = 'Must onboard at least 1 user';
    } else if (initialUsersNum > 100) {
      newErrors.initialUsers = 'Maximum 100 users for the trial';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    createMutation.mutate(
      {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim().toLowerCase(),
        countryCode: formData.countryCode,
        mobile: formData.mobile.trim(),
        initialUsers: parseInt(formData.initialUsers, 10),
        notes: formData.notes.trim() || null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({
            companyName: '',
            contactName: '',
            email: '',
            countryCode: '+91',
            mobile: '',
            initialUsers: '1',
            notes: '',
          });
          setErrors({});
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          Create Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new enterprise customer to the platform. They will start in
            pending status until you provision their IDCONNECTION code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">Company Name *</label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g., Acme Corporation"
              className={errors.companyName ? 'border-destructive' : ''}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactName" className="text-sm font-medium">Contact Name *</label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="e.g., John Smith"
              className={errors.contactName ? 'border-destructive' : ''}
            />
            {errors.contactName && (
              <p className="text-xs text-destructive">{errors.contactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email *</label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., john@acme.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-2">
              <label htmlFor="countryCode" className="text-sm font-medium">Country</label>
              <Select
                value={formData.countryCode}
                onValueChange={value => setFormData({ ...formData, countryCode: value })}
              >
                <SelectTrigger id="countryCode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map(country => (
                    <SelectItem key={`${country.code}-${country.iso}`} value={country.code}>
                      {country.flag} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label htmlFor="mobile" className="text-sm font-medium">Mobile Number *</label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g., 9530654704"
                className={errors.mobile ? 'border-destructive' : ''}
              />
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="initialUsers" className="text-sm font-medium">Initial Users *</label>
            <Input
              id="initialUsers"
              type="number"
              min="1"
              max="100"
              value={formData.initialUsers}
              onChange={e => setFormData({ ...formData, initialUsers: e.target.value })}
              className={errors.initialUsers ? 'border-destructive' : ''}
            />
            {errors.initialUsers && (
              <p className="text-xs text-destructive">{errors.initialUsers}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of users to onboard (1–100 for trial)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this customer..."
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/2000 characters
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              'Create Customer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
