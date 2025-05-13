"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrganizationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (organizationName: string) => void;
  email: string;
}

export function OrganizationConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  email,
}: OrganizationConfirmationDialogProps) {
  const [organizationName, setOrganizationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      toast({
        title: "Nama Perusahaan Diperlukan",
        description: "Silakan masukkan nama perusahaan Anda.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onConfirm(organizationName);
    } catch (error) {
      console.error("Error confirming organization:", error);
      toast({
        title: "Error",
        description: "Gagal mengonfirmasi organisasi. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Konfirmasi Perusahaan
          </DialogTitle>
          <DialogDescription>
            Untuk melengkapi pendaftaran, silakan masukkan nama perusahaan Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organization" className="text-right">
                Perusahaan
              </Label>
              <Input
                id="organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Masukkan nama perusahaan Anda"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Konfirmasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
