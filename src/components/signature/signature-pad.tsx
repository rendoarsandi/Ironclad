"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pen, Trash2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth-context";
import { useToast } from "@/hooks/use-toast";

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  disabled?: boolean;
  initialSignature?: string | null;
  height?: number;
  width?: number;
  className?: string;
  contractId?: string;
  saveToDatabase?: boolean;
}

export function SignaturePad({
  onSignatureChange,
  disabled = false,
  initialSignature = null,
  height = 200,
  width = 500,
  className = "",
  contractId,
  saveToDatabase = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [signature, setSignature] = useState<string | null>(initialSignature);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  // Load user's signature from database if available
  useEffect(() => {
    const loadUserSignature = async () => {
      if (!user || initialSignature) return;

      try {
        const { data, error } = await supabase
          .from('signatures')
          .select('signature_image_url')
          .eq('user_id', user.id)
          .is('contract_id', null) // Get default signature (not tied to a contract)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading signature:', error);
          return;
        }

        if (data && data.signature_image_url) {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);
            setSignature(data.signature_image_url);
            onSignatureChange(data.signature_image_url);
          };
          img.src = data.signature_image_url;
        }
      } catch (error) {
        console.error('Error loading signature:', error);
      }
    };

    loadUserSignature();
  }, [user, initialSignature, onSignatureChange]);

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setLastPosition({ x, y });
  };

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on touch devices
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    setLastPosition({ x, y });
  };

  // End drawing
  const endDrawing = () => {
    if (!isDrawing || disabled) return;

    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    onSignatureChange(signatureData);
  };

  // Clear signature
  const clearSignature = () => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setSignature(null);
    onSignatureChange(null);
  };

  // Save signature to database
  const saveSignature = async () => {
    if (!user || !signature) {
      toast({
        title: "Error",
        description: "Anda harus login dan membuat tanda tangan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const signatureData = {
        user_id: user.id,
        signature_image_url: signature,
        contract_id: contractId || null,
        signed_at: new Date().toISOString(),
        ip_address: "127.0.0.1", // In a real app, you would get the actual IP
        metadata: { browser: navigator.userAgent }
      };

      const { data, error } = await supabase
        .from('signatures')
        .insert(signatureData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Tanda tangan Anda telah disimpan",
      });

      // If this is for a contract, update the contract status
      if (contractId) {
        await supabase
          .from('contracts')
          .update({ status: 'signed' })
          .eq('id', contractId);
      }

    } catch (error) {
      console.error('Error saving signature:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan tanda tangan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pen className="h-5 w-5 mr-2" />
          {disabled ? "Tanda Tangan Anda" : "Buat Tanda Tangan Anda"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`border rounded-md ${disabled ? "bg-gray-50" : ""}`}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`border border-dashed border-gray-300 rounded-md w-full touch-none ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
      </CardContent>
      {!disabled && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={clearSignature} disabled={disabled || isSaving}>
            <Trash2 className="h-4 w-4 mr-2" /> Hapus
          </Button>

          {saveToDatabase && (
            <Button
              onClick={saveSignature}
              disabled={disabled || !signature || isSaving}
              className="ml-2"
            >
              {isSaving ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Simpan Tanda Tangan
                </>
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
