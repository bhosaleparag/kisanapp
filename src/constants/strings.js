/**
 * KisanApp Marathi (मराठी) Copy Strings
 * Centralized dictionary for all farmer-facing app text.
 * Organized by module to keep screens clean and easy to maintain.
 */
export const STRINGS = {
  common: {
    appName: "लिनीअर शेती",
    welcome: "स्वागत आहे!",
    save: "जतन करा",
    cancel: "रद्द करा",
    back: "मागे",
    confirm: "नक्की करा",
    loading: "लोड होत आहे...",
    error: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    noData: "माहिती उपलब्ध नाही",
    phone: "मोबाईल नंबर",
    submit: "प्रस्तुत करा",
    camera: "कॅमेरा वापरा",
    gallery: "गॅलरीमधून निवडा",
    removePhoto: "फोटो काढा",
    permissionDenied: "परवानगी नाकारली. कृपया सेटिंग्जमधून परवानग्या सुरू करा.",
    success: "यशस्वी",
    errorTitle: "त्रुटी"
  },
  nav: {
    home: "मुख्यपृष्ठ",
    cowshed: "माझा गोठा",
    marketplace: "बाजारपेठ",
    services: "शेतकरी सेवा",
    videos: "मार्गदर्शन व्हिडिओ"
  },
  cowshed: {
    title: "माझा गोठा",
    addCow: "नवीन जनावराची नोंद करा",
    cowName: "जनावराचे नाव / नंबर",
    breed: "जात (उदा. गीर, खिलार)",
    age: "वय (वर्षे)",
    milkYield: "दैनिक दूध (लिटर)",
    healthStatus: "आरोग्य स्थिती",
    healthy: "निरोगी",
    sick: "आजारी",
    milkTracker: "दूध नोंदणी",
    weightTracker: "वजन नोंदणी"
  },
  marketplace: {
    title: "बाजारपेठ",
    buySell: "खरेदी / विक्री",
    fodder: "चारा व पेंड",
    fertilizer: "खते व औषधे",
    price: "किंमत (₹)",
    seller: "विक्रेत्याचे नाव",
    contact: "संपर्क करा",
    uploadImage: "फोटो अपलोड करा",
    postListing: "जाहिरात टाका"
  },
  services: {
    title: "शेतकरी सेवा",
    tractor: "ट्रॅक्टर भाड्याने",
    drone: "ड्रोन फवारणी",
    labor: "शेतमजूर",
    pricePerHour: "दर प्रति तास (₹)",
    bookNow: "आत्ता बुक करा"
  },
  videos: {
    title: "मार्गदर्शन व्हिडिओ",
    addVideo: "नवीन व्हिडिओ जोडा",
    organicFarming: "सेंद्रिय शेती",
    cropDisease: "पीक रोग व्यवस्थापन",
    modernTech: "आधुनिक तंत्रज्ञान",

    // New strings for simplified UI
    subtitle: "शेती व गोठा व्यवस्थापनासाठी तज्ञांचे मोफत मार्गदर्शन",
    selectInfoType: "माहितीचा प्रकार निवडा",
    subjects: "विषय (Subjects)",
    subjectsSubtitle: "6 प्रमुख विषय व विभाग",
    subjectsDesc: "पैदावर सुधारणा, सकस चारा नियोजन, पशु आरोग्य आणि सेंद्रिय शेती संबंधित मार्गदर्शन.",

    experts: "मार्गदर्शक (Guides & Experts)",
    expertsSubtitle: "तज्ञ व अनुभवी वैज्ञानिक",
    expertsDesc: "कृषी विद्यापीठाचे प्राध्यापक, कृषी शास्त्रज्ञ आणि यशस्वी शेतकऱ्यांचे अनुभव व सल्ले.",

    companies: "संस्था व कंपन्या (Institutions)",
    companiesSubtitle: "शासकीय संस्था व कंपन्या",
    companiesDesc: "कृषी विभागाच्या योजना, सह्याद्री फार्म्स व कृषी विज्ञान केंद्रांचे अधिकृत व्हिडिओ.",

    selectSubject: "विषय निवडा",
    selectExpert: "मार्गदर्शक निवडा",
    selectCompany: "संस्था निवडा",
    selectDefault: "निवड करा",

    searchPlaceholder: "येथे शोधा...",
    videoSearchPlaceholder: "व्हिडिओ शोधा...",
    voiceSearchTitle: "कृषी व्हॉइस सर्च (Voice Search)",
    voiceSearchActive: "मराठी व्हॉइस असिस्टंट सुरू आहे...\nकृपया तुमच्या आवाजात सर्च करायचा शब्द बोला.",
    voiceSearchSpeakVideo: "मराठी व्हॉइस असिस्टंट सुरू आहे...\nकृपया तुमच्या आवाजात व्हिडिओचा विषय बोला.",
    voiceSearchCancel: "रद्द करा",
    voiceSearchOk: "ठीक आहे",
    voiceSearchNoMatch: "काही शब्द ओळखता आले नाहीत. कृपया लिहून शोधा.",
    voiceSearchResultTitle: "व्हॉइस सर्च परिणाम",

    videoListTitle: "मार्गदर्शन व्हिडिओ यादी",
    backBtn: "मागे",
    playerBackBtn: "मागे जा",
    videoInfoTitle: "व्हिडिओ माहिती:",
    durationLabel: "⏱️ ",
    minutesLabel: " मिनिटे",
    guideLabel: "👤 मार्गदर्शक:",
    subjectLabel: "📚 विषय:",
    companyLabel: "🏢 कंपनी/संस्था:",

    // Subject categories
    breedManagement: "पैदावर व्यवस्थापन",
    breedManagementDesc: "जातीवंत जनावरांची निवड, पैदावर आणि वंश सुधारणा",

    feedManagement: "चारा व खाद्य व्यवस्थापन",
    feedManagementDesc: "सकस पशुखाद्य, मुरघास (सायलेज) आणि चारा नियोजन",

    animalManagement: "जनावरांचे व्यवस्थापन",
    animalManagementDesc: "गोठा स्वच्छता, आरोग्य आणि दूध उत्पादन वाढ",

    organicFarmingDesc: "विषमुक्त शेती, कंपोस्ट खत आणि सेंद्रिय औषध फवारणी",
    cropDiseaseDesc: "पिकांवरील रोग नियंत्रण आणि जैविक कीटकनाशके",
    modernTechDesc: "ड्रोन फवारणी, आधुनिक यंत्रे आणि स्मार्ट शेती पद्धती",

    // Add Video Form strings
    saveSuccess: "व्हिडिओ यशस्वीरीत्या जतन केला आहे.",
    saveError: "व्हिडिओ जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
    formTitleLabel: "व्हिडिओचे शीर्षक (Video Title)",
    formTitlePlaceholder: "उदा. अधिक दुधासाठी गोठा व्यवस्थापन",
    formVideoUrlLabel: "यूट्यूब व्हिडिओ लिंक (YouTube URL)",
    formVideoUrlPlaceholder: "उदा. https://www.youtube.com/watch?v=...",
    formSubjectLabel: "विषय / श्रेणी (Subject / Category)",
    formSubjectPlaceholder: "श्रेणी निवडा...",
    formAuthorLabel: "मार्गदर्शक (Expert / Guide)",
    formAuthorPlaceholder: "उदा. डॉ. हरीश माने",
    formCompanyLabel: "संस्था / कंपनी (Institution)",
    formCompanyPlaceholder: "उदा. सह्याद्री फार्म",
    formDurationLabel: "कालावधी (Duration)",
    formDurationPlaceholder: "उदा. 05:20",
    formDescriptionLabel: "व्हिडिओचे सविस्तर वर्णन (Description)",
    formDescriptionPlaceholder: "व्हिडिओबद्दल माहिती लिहा..."
  },
  auth: {
    login: "लॉगिन करा",
    otpSent: "तुमच्या मोबाईलवर ओटीपी (OTP) पाठवला आहे",
    verifyOtp: "ओटीपी सत्यापित करा",
    enterPhone: "तुमचा 10 अंकी मोबाईल नंबर टाका",
    otpRequestError: "ओटीपी पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा किंवा चाचणीसाठी मॉक मोड वापरा.",
    enterCorrectOtp: "कृपया अचूक 6 अंकी ओटीपी कोड प्रविष्ट करा.",
    otpVerificationFailed: "ओटीपी पडताळणी अयशस्वी. कृपया अचूक कोड टाका.",
    sendOtp: "ओटीपी (OTP) पाठवा",
    phoneNumberLabel: "नंबर",
    enterOtpLabel: "6-अंकी ओटीपी (OTP) प्रविष्ट करा",
    otpPlaceholder: "उदा. 123456",
    backBtn: "मागे जा",
    userBlocked: "तुमचे खाते ब्लॉक केले आहे. कृपया ॲडमिनशी संपर्क साधा.",
    userInactive: "तुमचे खाते सक्रिय नाही. कृपया ॲडमिनशी संपर्क साधा."
  },
  splash: {
    tagline: "प्रगतीशील शेतकऱ्यांचे डिजिटल व्यासपीठ",
    loadingApp: "ॲप सुरू होत आहे..."
  },
  profile: {
    personalInfo: "वैयक्तिक माहिती",
    nameLabel: "शेतकऱ्याचे पूर्ण नाव",
    namePlaceholder: "उदा. रामराव गायकवाड",
    phonePlaceholder: "उदा. 9876543210",
    roleLabel: "भूमिका निवडा",
    buyer: "खरेदीदार",
    seller: "विक्रेता",
    both: "दोन्ही",
    addressTitle: "पत्ता (सोलापूर जिल्हा विशेष)",
    districtLabel: "जिल्हा",
    solapur: "सोलापूर",
    selectTaluka: "तालुका निवडा",
    talukaPlaceholder: "तालुका निवडण्यासाठी येथे दाबा...",
    selectVillage: "गाव निवडा",
    villagePlaceholder: "गाव निवडण्यासाठी येथे दाबा...",
    selectTalukaFirst: "आधी तालुका निवडा...",
    pincodeLabel: "पिनकोड (Pincode)",
    pincodePlaceholder: "उदा. 413001",
    mapSelectTitle: "नकाशावरून शेतीचे ठिकाण निवडा",
    mapSelectSub: "नकाशात तुमच्या शेताच्या जागेवर टॅप करा. अचूक स्थान मिळवले जाईल:",
    latitude: "अक्षांश",
    longitude: "रेखांश",
    farmDetailsTitle: "शेतीचे सविस्तर तपशील",
    totalAreaLabel: "एकूण शेत जमीन (एकर)",
    totalAreaPlaceholder: "उदा. 10",
    cultivatedAreaLabel: "लागवडीखालील/वापरात असलेले क्षेत्र (एकर)",
    cultivatedAreaPlaceholder: "उदा. 8",
    mainCropLabel: "मुख्य पिके",
    mainCropPlaceholder: "उदा. ऊस, कांदा, डाळिंब",
    logoutBtn: "लॉगआउट करा (Logout)",
    logoutConfirmTitle: "तुम्हाला नक्की लॉगआउट करायचे आहे का?",
    logoutConfirmBtn: "लॉगआउट करा",
    gpsSuccessMsg: "जीपीएस (GPS) उपग्रहाद्वारे अचूक स्थान प्राप्त झाले!",
    saveSuccess: "तुमची प्रोफाईल यशस्वीरीत्या जतन केली आहे.",
    saveError: "माहिती जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
    logoutError: "लॉगआउट करताना त्रुटी आली.",
    ratingLabel: "रेटिंग",
    activeFarmer: "सक्रिय शेतकरी"
  }
};
