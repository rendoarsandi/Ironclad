"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Contract, ContractStatus } from "@/types"; 
import { useAuth } from "@/hooks/use-auth-context";

interface ContractUploadDialogProps {
  onUploadSuccess: (newContract: Contract) => void;
}

export function ContractUploadDialog({ onUploadSuccess }: ContractUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contractName, setContractName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      if (!contractName) {
        setContractName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Auto-fill name
      }
    }
  };

  const resetForm = () => {
    setContractName("");
    setFile(null);
    const fileInput = document.getElementById('contract-file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleSubmit = async () => {
    if (!file || !contractName) {
      toast({
        title: "Missing Information",
        description: "Please provide a contract name and select a file.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload a contract.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate upload and Firestore write
    console.log("Uploading contract:", contractName, file.name);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const newContract: Contract = {
      id: Math.random().toString(36).substr(2, 9), // Mock ID
      name: contractName,
      uploadedBy: user.name || user.email, // Use authenticated user's name or email
      uploadDate: new Date().toISOString(),
      status: "draft" as ContractStatus,
      version: 1,
      filePath: `contracts/${file.name}`, // Mock file path
      fileUrl: URL.createObjectURL(file), // For local preview, actual URL from Firebase Storage
    };
    
    onUploadSuccess(newContract); // Callback to update parent state

    toast({
      title: "Upload Successful",
      description: `Contract "${contractName}" has been uploaded.`,
    });

    setIsLoading(false);
    setIsOpen(false);
    resetForm();
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Contract</DialogTitle>
          <DialogDescription>
            Provide a name and select the contract document to upload.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contract-name" className="text-right">
              Name
            </Label>
            <Input
              id="contract-name"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Master Service Agreement"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contract-file-upload" className="text-right">
              File
            </Label>
            <Input
              id="contract-file-upload"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
              accept=".pdf,.doc,.docx,.txt" // Specify accepted file types
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground col-span-4 text-center">Selected: {file.name}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || !file || !contractName} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
