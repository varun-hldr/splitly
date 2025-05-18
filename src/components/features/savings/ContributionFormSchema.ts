
import { z } from 'zod';

const screenshotValidation = typeof window !== 'undefined'
  ? z.instanceof(FileList)
    .refine(fileList => fileList && fileList.length > 0, "Screenshot is required.")
    .refine(fileList => {
      if (!fileList || fileList.length === 0) return true;
      return fileList[0].size <= 5 * 1024 * 1024;
    }, "Screenshot must be 5MB or less.")
    .refine(fileList => {
      if (!fileList || fileList.length === 0) return true;
      return ["image/jpeg", "image/png", "image/webp"].includes(fileList[0].type);
    }, "Only JPG, PNG, or WEBP images are allowed.")
  : z.any();

export const ContributionFormSchema = z.object({
  tripId: z.string().min(1, { message: "Trip selection is required." }), // Assuming ObjectId as string
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(50, { message: "Username must be less than 50 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }).max(100000, { message: "Amount seems too high." }),
  screenshot: screenshotValidation,
});

export type ContributionFormValues = z.infer<typeof ContributionFormSchema>;
