import { z } from 'zod';

/**
 * Form Validation Schemas
 * Standard Zod declarations representing input limitations.
 * Features highly detailed error states written completely in Marathi.
 */

// 1. Mobile OTP Authentication Schema
export const authSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'मोबाईल नंबर आवश्यक आहे.' })
    .regex(/^[0-9]{10}$/, { message: 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.' }),
});

// 1b. Onboarding Walkthrough Schema (Name & Mobile Number)
export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'नाव किमान २ अक्षरी असावे.' })
    .max(50, { message: 'नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  phone: z
    .string()
    .min(1, { message: 'मोबाईल नंबर आवश्यक आहे.' })
    .regex(/^[0-9]{10}$/, { message: 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.' }),
});

// 2. Cowshed livestock registration Schema
export const cowshedSchema = z.object({
  cowName: z
    .string()
    .min(1, { message: 'जनावराचे नाव किंवा टॅग नंबर आवश्यक आहे.' })
    .max(50, { message: 'नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  breed: z
    .string()
    .min(1, { message: 'जनावराची जात आवश्यक आहे.' })
    .max(50, { message: 'जात ५० अक्षरांपेक्षा जास्त नसावी.' }),
  age: z
    .string()
    .min(1, { message: 'वय आवश्यक आहे.' })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0.1 && val <= 30, {
      message: 'वय ०.१ ते ३० वर्षांच्या दरम्यान असावे.',
    }),
  milkYield: z
    .string()
    .min(1, { message: 'दैनिक दूध क्षमता आवश्यक आहे.' })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: 'दूध क्षमता ० ते १०० लिटरच्या दरम्यान असावी.',
    }),
  healthStatus: z.enum(['healthy', 'sick'], {
    errorMap: () => ({ message: 'कृपया आरोग्य स्थिती निवडा.' }),
  }),
});

// 3. Marketplace listing post Schema
export const marketplaceSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'जाहिरातीचे नाव किमान ३ अक्षरी असावे.' })
    .max(80, { message: 'जाहिरातीचे नाव ८० अक्षरांपेक्षा जास्त नसावे.' }),
  category: z
    .string()
    .min(1, { message: 'कृपया वर्ग निवडा (चारा / औषधे / पशु).' }),
  price: z
    .string()
    .min(1, { message: 'किंमत आवश्यक आहे.' })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'किंमत शून्यापेक्षा जास्त असावी.',
    }),
  sellerName: z
    .string()
    .min(2, { message: 'विक्रेत्याचे नाव किमान २ अक्षरी असावे.' }),
  contactPhone: z
    .string()
    .min(1, { message: 'संपर्कासाठी मोबाईल नंबर आवश्यक आहे.' })
    .regex(/^[0-9]{10}$/, { message: 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.' }),
  description: z
    .string()
    .max(400, { message: 'माहिती ४०० अक्षरांपेक्षा जास्त नसावी.' })
    .optional(),
});

// 4. Video Guidance Tutorial Schema
export const videoSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, { message: 'व्हिडिओचे शीर्षक किमान ३ अक्षरी असावे.' })
    .max(100, { message: 'शीर्षक १०० अक्षरांपेक्षा जास्त नसावे.' }),
  videoUrl: z
    .string()
    .url({ message: 'कृपया वैध व्हिडिओ URL प्रविष्ट करा.' }),
  thumbnailUri: z
    .string()
    .optional(),
  category: z.string().optional(),
  categoryLabel: z.string().optional(),
  author: z
    .string()
    .min(2, { message: 'मार्गदर्शकाचे नाव आवश्यक आहे.' }),
  subject: z.string().min(1, { message: 'कृपया वैध विषय निवडा.' }).refine(
    (val) => ['semen_info', 'wws_semen', 'abs_semen', 'denmark_semen'].includes(val),
    { message: 'कृपया वैध विषय निवडा.' }
  ),
  company: z
    .string()
    .min(2, { message: 'कंपनी/संस्थेचे नाव आवश्यक आहे.' }),
  description: z
    .string()
    .min(10, { message: 'वर्णन किमान १० अक्षरी असावे.' })
    .max(500, { message: 'वर्णन ५०० अक्षरांपेक्षा जास्त नसावे.' }),
  duration: z
    .string()
    .min(1, { message: 'व्हिडिओचा कालावधी आवश्यक आहे (उदा. ०५:२०).' })
    .regex(
      /^(([0-9]{1,2}:[0-5][0-9]:[0-5][0-9]|[0-9]{1,2}:[0-5][0-9])|([०-९]{1,2}:[०-५][०-९]:[०-५][०-९]|[०-९]{1,2}:[०-५][०-९]))$/,
      { message: 'कालावधी योग्य स्वरूपात लिहा (उदा. ०५:२०).' }
    ),
});

// 5. User Profile Form Schema
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'नाव किमान २ अक्षरी असावे.' })
    .max(50, { message: 'नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  phone: z
    .string()
    .min(1, { message: 'मोबाईल नंबर आवश्यक आहे.' })
    .regex(/^[0-9]{10}$/, { message: 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.' }),
  role: z.enum(['admin', 'buyer', 'seller', 'both'], {
    errorMap: () => ({ message: 'कृपया तुमची भूमिका निवडा (प्रशासक / खरेदीदार / विक्रेता / दोन्ही).' }),
  }),
  village: z
    .string()
    .min(2, { message: 'गावाचे नाव आवश्यक आहे.' })
    .max(50, { message: 'गावाचे नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  taluka: z
    .string()
    .min(2, { message: 'तालुक्याचे नाव आवश्यक आहे.' })
    .max(50, { message: 'तालुक्याचे नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  district: z
    .string()
    .min(2, { message: 'जिल्ह्याचे नाव आवश्यक आहे.' })
    .max(50, { message: 'जिल्ह्याचे नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  pincode: z
    .string()
    .min(1, { message: 'पिनकोड आवश्यक आहे.' })
    .regex(/^[0-9]{6}$/, { message: 'कृपया अचूक ६ अंकी पिनकोड टाका.' }),
  farmDetails: z.object({
    totalArea: z
      .string()
      .min(1, { message: 'एकूण जमीन क्षेत्र आवश्यक आहे.' })
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val >= 0, {
        message: 'एकूण क्षेत्र शून्यापेक्षा मोठे असावे.',
      }),
    cultivatedArea: z
      .string()
      .min(1, { message: 'वापरातील क्षेत्र आवश्यक आहे.' })
      .transform((val) => parseFloat(val))
      .refine((val) => !isNaN(val) && val >= 0, {
        message: 'वापरातील क्षेत्र शून्यापेक्षा मोठे असावे.',
      }),
    mainCrop: z
      .string()
      .min(2, { message: 'मुख्य पिकाचे नाव आवश्यक आहे.' })
      .max(50, { message: 'पिकाचे नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  }).refine((data) => data.cultivatedArea <= data.totalArea, {
    message: 'वापरातील क्षेत्र एकूण क्षेत्रापेक्षा जास्त नसावे.',
    path: ['cultivatedArea'],
  }),
});

// 6. Semen Brand Form Validation Schema
export const semenBrandSchema = z.object({
  brandName: z
    .string()
    .min(1, { message: 'ब्रँडचे नाव आवश्यक आहे.' })
    .min(2, { message: 'नाव किमान २ अक्षरी असावे.' })
    .max(50, { message: 'नाव ५० अक्षरांपेक्षा जास्त नसावे.' }),
  logoUrl: z
    .string({ required_error: 'ब्रँडचा लोगो आवश्यक आहे.' })
    .min(1, { message: 'ब्रँडचा लोगो आवश्यक आहे.' }),
  isActive: z.boolean().default(true),
});

// 7. Bull Record Validation Schema
export const bullRecordSchema = z.object({
  bullName: z
    .string()
    .min(1, { message: 'वळूचे नाव आवश्यक आहे.' })
    .min(2, { message: 'नाव किमान २ अक्षरी असावे.' })
    .max(80, { message: 'नाव ८० अक्षरांपेक्षा जास्त नसावे.' }),
  naabCode: z
    .string()
    .min(1, { message: 'NAAB कोड आवश्यक आहे.' })
    .min(5, { message: 'NAAB कोड किमान ५ अक्षरी असावे.' })
    .max(20, { message: 'NAAB कोड २० अक्षरांपेक्षा जास्त नसावा.' }),
  registrationNumber: z
    .string()
    .min(1, { message: 'नोंदणी क्रमांक आवश्यक आहे.' }),
  tpi: z.string().optional(),
  breed: z
    .string()
    .min(1, { message: 'जनावराची जात आवश्यक आहे.' }),
  photoUrl: z
    .string()
    .url({ message: 'कृपया वैध इमेज URL प्रविष्ट करा.' })
    .or(z.literal(''))
    .optional(),
  photoUrls: z.array(z.string()).optional(),
  
  // Pedigree
  sire: z.string().optional(),
  damSire: z.string().optional(),
  mgs: z.string().optional(),
  mgd: z.string().optional(),
  mggs: z.string().optional(),
  
  // Evaluation Date
  evaluationDate: z.string().optional(),

  // CDCB Chart Metrics
  milkLbs: z.string().optional(),
  fatLbs: z.string().optional(),
  fatPercent: z.string().optional(),
  proteinLbs: z.string().optional(),
  proteinPercent: z.string().optional(),
  combinedFatProtein: z.string().optional(),
  reliability: z.string().optional(),
  
  productiveLife: z.string().optional(),
  daughterPregnancyRate: z.string().optional(),
  sireConceptionRate: z.string().optional(),
  heiferConceptionRate: z.string().optional(),
  cowConceptionRate: z.string().optional(),
  betaCasein: z.string().optional(),
  somaticCellScore: z.string().optional(),
  sireCalvingEase: z.string().optional(),
  daughterCalvingEase: z.string().optional(),
  sireStillbirth: z.string().optional(),
  daughterStillbirth: z.string().optional(),
  
  mast: z.string().optional(),
  metr: z.string().optional(),
  keto: z.string().optional(),
  repl: z.string().optional(),
  dsab: z.string().optional(),
  mfev: z.string().optional(),
  
  ptat: z.string().optional(),
  udderComposite: z.string().optional(),
  feetLegsComposite: z.string().optional(),
  bodyWeightComposite: z.string().optional(),
});
