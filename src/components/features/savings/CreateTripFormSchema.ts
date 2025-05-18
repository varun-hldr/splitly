
import { z } from 'zod';

const qrCodeImageValidation = typeof window !== 'undefined'
  ? z.instanceof(FileList)
    .refine(fileList => {
      if (!fileList || fileList.length === 0) return true; 
      return fileList[0].size <= 2 * 1024 * 1024; 
    }, "QR Code image must be 2MB or less.")
    .refine(fileList => {
      if (!fileList || fileList.length === 0) return true; 
      return ["image/jpeg", "image/png", "image/webp"].includes(fileList[0].type);
    }, "Only JPG, PNG, or WEBP images are allowed for QR code.")
    .optional() 
  : z.any().optional(); 

export const CreateTripFormSchema = z.object({
  name: z.string().min(3, { message: "Trip name must be at least 3 characters." }).max(100, { message: "Trip name must be less than 100 characters." }),
  description: z.string().max(500, { message: "Description must be less than 500 characters." }).optional().or(z.literal('')),
  goalAmount: z.coerce.number().positive({ message: "Goal amount must be a positive number." }).optional().or(z.literal('')),
  upiId: z.string().trim().max(100, { message: "UPI ID must be less than 100 characters."}).optional().or(z.literal('')),
  qrCodeImage: qrCodeImageValidation,
  // adminSecret: z.string().min(1, { message: "Admin secret key is required." }), // Removed
});

export type CreateTripFormValues = z.infer<typeof CreateTripFormSchema>;
