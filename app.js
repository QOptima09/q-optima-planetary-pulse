let audioCtx = null;
let sirenOsc = null;
let sirenActive = false;
let gisMap = null;
let currentGeoCircle = null;
let mapMarkers = [];
let evacRouteLine = null;
let latestAnalysisData = null;
let currentLanguage = "en";

// ---------------- MULTILINGUAL DICTIONARY ---------------- //
const translations = {
    en: {
        code: "en-US",
        header_sub: "AUTONOMOUS SATELLITE DISASTER INTELLIGENCE & RAPID DECISION SUPPORT PLATFORM",
        p1: "SATELLITE INGEST", p2: "RADIOMETRIC CAL / CLAHE", p3: "SPECTRAL TENSOR MAPPING",
        p4: "AI ANOMALY DETECTION", p5: "SEVERITY & KINETICS", p6: "RAPID DECISION SUPPORT",
        panel1_title: "01 / TELEMETRY & DISPATCH INGEST",
        lbl_sensor: "Satellite Sensor Constellation:",
        lbl_disaster: "Target Disaster Scenario:",
        btn_execute: "EXECUTE AI INFERENCE PIPELINE",
        lbl_logs: "REAL-TIME TELEMETRY STREAM",
        tab_ai: "BI-TEMPORAL CHANGE DETECTION", tab_map: "GIS INFRASTRUCTURE & EVACUATION MAP",
        badge_awaiting: "AWAITING INGEST", badge_complete: "INFERENCE COMPLETE",
        m_platform: "Platform:", m_conf: "Confidence:", m_area: "Impact Footprint:", m_threat: "Classification:",
        panel3_title: "03 / DECISION SUPPORT DOSSIER",
        standby_status: "STANDBY STATUS", standby_desc: "Armed. Awaiting satellite anomaly detection.",
        lbl_evac: "Evacuation Directive:", evac_monitoring: "MONITORING",
        mesh_header: "5M LOCAL RESPONDER MESH", mesh_active: "1 DEVICE ACTIVE",
        mesh_prox: "Target Proximity:", mesh_status: "Perimeter:", mesh_zone: "MONITORING ZONE",
        lbl_actions: "Tactical Resource Allocation Plan:",
        action_1: "System standing by for telemetry feed.", action_2: "Automated drone swarm dispatch ready.",
        btn_siren: "TEST EMERGENCY SIREN", btn_print: "PRINT COMMAND REPORT", btn_json: "DOWNLOAD JSON TELEMETRY",
        modal_title: "LOCAL PROXIMITY ALERT TRIGGERED",
        modal_sub: "DEVICE LOCATED WITHIN <= 5 METERS OF CRITICAL DISASTER ZONE",
        modal_crit: "IMMEDIATE EVACUATION REQUIRED",
        modal_body: "Autonomous satellite telemetry has detected critical thermal/inundation escalation. Evacuate to designated staging area immediately.",
        spoken_alert: "Emergency alert. Disaster detected within five meters proximity. Evacuate immediately."
    },
    hi: {
        code: "hi-IN",
        header_sub: "स्वायत्त उपग्रह आपदा आसूचना एवं त्वरित निर्णय समर्थन प्रणाली",
        p1: "उपग्रह डेटा अधिग्रहण", p2: "रेडियोमेट्रिक शोधन / CLAHE", p3: "स्पेक्ट्रल टेंसर मैपिंग",
        p4: "एआई विसंगति पहचान", p5: "तीव्रता एवं क्षति गतिशीलता", p6: "त्वरित निर्णय समर्थन",
        panel1_title: "०१ / टेलीमेट्री एवं मोबाइल डिस्पैच इनपुट",
        lbl_sensor: "उपग्रह नक्षत्र एवं सेंसर मोड:",
        lbl_disaster: "आपदा लक्ष्य परिदृश्य:",
        btn_execute: "एआई पाइपलाइन निष्पादित करें",
        lbl_logs: "रीयल-टाइम टेलीमेट्री स्ट्रीम",
        tab_ai: "द्वि-कालिक परिवर्तन पहचान", tab_map: "जीआईएस बुनियादी ढांचा एवं निकासी मार्ग",
        badge_awaiting: "डेटा प्रतीक्षारत", badge_complete: "विश्लेषण संपन्न",
        m_platform: "प्लेटफ़ॉर्म:", m_conf: "सटीकता दर:", m_area: "प्रभावित क्षेत्रफल:", m_threat: "खतरा वर्गीकरण:",
        panel3_title: "०३ / निर्णय समर्थन रिपोर्ट",
        standby_status: "स्टैंडबाय स्थिति", standby_desc: "सिस्टम तैयार। उपग्रह विसंगति की प्रतीक्षा है।",
        lbl_evac: "निकासी निर्देश:", evac_monitoring: "सतत निगरानी",
        mesh_header: "५ मीटर स्थानीय प्रत्युत्तर मेश", mesh_active: "१ डिवाइस सक्रिय",
        mesh_prox: "लक्षित दूरी:", mesh_status: "सुरक्षा घेरा:", mesh_zone: "निगरानी क्षेत्र",
        lbl_actions: "रणनीतिक संसाधन आवंटन योजना:",
        action_1: "उपग्रह टेलीमेट्री की प्रतीक्षा है।", action_2: "ड्रोन दल त्वरित तैनाती हेतु तैयार है।",
        btn_siren: "आपातकालीन सायरन बजाएं", btn_print: "कमांड रिपोर्ट प्रिंट करें", btn_json: "टेलीमेट्री JSON डाउनलोड करें",
        modal_title: "स्थानीय ५ मीटर निकटता चेतावनी",
        modal_sub: "उपकरण आपदा क्षेत्र के ५ मीटर के दायरे में स्थित है",
        modal_crit: "तत्काल सुरक्षित स्थान पर जाएं",
        modal_body: "उपग्रह विश्लेषण द्वारा गंभीर आपदा की पुष्टि हुई है। तुरंत सुरक्षित क्षेत्र की ओर प्रस्थान करें।",
        spoken_alert: "आपातकालीन चेतावनी। पांच मीटर के दायरे में गंभीर आपदा का पता चला है। कृपया तुरंत सुरक्षित स्थान पर जाएं।"
    },
    mr: {
        code: "mr-IN",
        header_sub: "उपग्रह आधारित स्वयंचलित आपत्ती गुप्तवार्ता व निर्णय प्रणाली",
        p1: "उपग्रह डेटा संकलन", p2: "रेडिओमेट्रिक प्रक्रिया / CLAHE", p3: "स्पेक्ट्रल टेन्सर मॅपिंग",
        p4: "एआय आपत्ती शोध", p5: "तीव्रता व परिणाम मूल्यांकन", p6: "जलद निर्णय साहाय्य",
        panel1_title: "०१ / टेलिमेट्री व मोबाइल डिस्पॅच इनपुट",
        lbl_sensor: "उपग्रह प्रणाली व सेन्सर मोड:",
        lbl_disaster: "आपत्ती प्रकार निवडा:",
        btn_execute: "एआय प्रणाली कार्यान्वित करा",
        lbl_logs: "थेट टेलिमेट्री नोंदी",
        tab_ai: "द्वि-कालिक बदल विश्लेषण", tab_map: "जीआयएस पायाभूत सुविधा व स्थलांतर नकाशा",
        badge_awaiting: "प्रतीक्षेत", badge_complete: "विश्लेषण पूर्ण",
        m_platform: "प्लॅटफॉर्म:", m_conf: "विश्वासार्हता:", m_area: "प्रभावित क्षेत्र:", m_threat: "धोका पातळी:",
        panel3_title: "०३ / निर्णय साहाय्य अहवाल",
        standby_status: "सज्जता स्थिती", standby_desc: "प्रणाली सज्ज. उपग्रह सिग्नलची वाट पाहत आहे.",
        lbl_evac: "स्थलांतर आदेश:", evac_monitoring: "सक्रिय देखरेख",
        mesh_header: "५ मीटर स्थानिक प्रतिसाद जाळे", mesh_active: "१ डिव्हाइस सक्रिय",
        mesh_prox: "अंदाजे अंतर:", mesh_status: "परिमिती स्थिती:", mesh_zone: "देखरेख क्षेत्र",
        lbl_actions: "संसाधन वाटप आराखडा:",
        action_1: "टेलिमेट्री डेटाची प्रतीक्षा आहे.", action_2: "ड्रोन पथक तत्काळ मदतीस सज्ज आहे.",
        btn_siren: "सायरेन चाचणी", btn_print: "आदेश अहवाल छापा", btn_json: "JSON डेटा डाऊनलोड करा",
        modal_title: "५ मीटर परिसर धोका इशारा",
        modal_sub: "डिव्हाइस आपत्ती केंद्रापासून ५ मीटर अंतरावर आढळले आहे",
        modal_crit: "तातडीने सुरक्षित स्थळी जा",
        modal_body: "उपग्रह विश्लेषणाद्वारे गंभीर आपत्तीची पुष्टी झाली आहे. त्वरित सुरक्षित स्थळी स्थलांतर करा.",
        spoken_alert: "धोका इशारा. पाच मीटर अंतरावर आपत्ती आढळली आहे. त्वरित सुरक्षित स्थळी जा."
    },
    ta: {
        code: "ta-IN",
        header_sub: "செயற்கைக்கோள் பேரிடர் நுண்ணறிவு மற்றும் முடிவு ஆதரவு தளம்",
        p1: "செயற்கைக்கோள் தரவு", p2: "ரேடியோமெட்ரிக் திருத்தம்", p3: "ஸ்பெக்ட்ரல் மேப்பிங்",
        p4: "AI பேரிடர் கண்டறிதல்", p5: "தீவிரத்தன்மை மதிப்பீடு", p6: "துரித முடிவு ஆதரவு",
        panel1_title: "01 / டெலிமெட்ரி மற்றும் கட்டுப்பாடுகள்",
        lbl_sensor: "சென்சார் முறை:", lbl_disaster: "பேரிடர் வகை:",
        btn_execute: "AI அமைப்பை இயக்கு", lbl_logs: "நேரடி பதிவுகள்",
        tab_ai: "மாற்ற பகுப்பாய்வு", tab_map: "GIS உள்கட்டமைப்பு வரைபடம்",
        badge_awaiting: "காத்திருக்கிறது", badge_complete: "முடிந்தது",
        m_platform: "செயற்கைக்கோள்:", m_conf: "நம்பகத்தன்மை:", m_area: "பாதிக்கப்பட்ட பகுதி:", m_threat: "அபாய நிலை:",
        panel3_title: "03 / முடிவு ஆதரவு ஆவணம்",
        standby_status: "தயார் நிலை", standby_desc: "கணினி தயார் நிலையில் உள்ளது.",
        lbl_evac: "வெளியேற்ற உத்தரவு:", evac_monitoring: "கண்காணிப்பு",
        mesh_header: "5 மீட்டர் எச்சரிக்கை நெட்வொர்க்", mesh_active: "1 சாதனம் இணைக்கப்பட்டுள்ளது",
        mesh_prox: "இலக்கு தூரம்:", mesh_status: "சுற்றளவு:", mesh_zone: "கண்காணிப்பு மண்டலம்",
        lbl_actions: "வள ஒதுக்கீடு திட்டம்:",
        action_1: "தரவுக்காக காத்திருக்கிறது.", action_2: "ட்ரோன் படை தயார் நிலையில் உள்ளது.",
        btn_siren: "எச்சரிக்கை சைரன்", btn_print: "அறிக்கையை அச்சிடுக", btn_json: "JSON பதிவிறக்கம்",
        modal_title: "5 மீட்டர் அருகாமை எச்சரிக்கை",
        modal_sub: "சாதனம் பேரிடர் பகுதிக்கு 5 மீட்டருக்குள் உள்ளது",
        modal_crit: "உடனடியாக வெளியேறவும்",
        modal_body: "செயற்கைக்கோள் தீவிர பேரிடரை கண்டறிந்துள்ளது. உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.",
        spoken_alert: "அவசர எச்சரிக்கை. ஐந்து மீட்டர் தூரத்தில் பேரிடர் கண்டறியப்பட்டுள்ளது. உடனடியாக வெளியேறவும்."
    },
    te: {
        code: "te-IN",
        header_sub: "ఉపగ్రహ ఆధారిత విపత్తు నిఘా మరియు నిర్ణయ మద్దతు వేదిక",
        p1: "ఉపగ్రహ డేటా సేకరణ", p2: "రేడియోమెట్రిక్ ప్రాసెసింగ్", p3: "స్పెక్ట్రల్ మ్యాపింగ్",
        p4: "AI విపత్తు గుర్తింపు", p5: "తీవ్రత అంచనా", p6: "నిర్ణయ మద్దతు",
        panel1_title: "01 / టెలిమెట్రీ మరియు నియంత్రణలు",
        lbl_sensor: "ఉపగ్రహ సెన్సార్ మోడ్:", lbl_disaster: "విపత్తు రకం:",
        btn_execute: "AI పైప్‌లైన్ ప్రారంభించండి", lbl_logs: "రియల్ టైమ్ లాగ్‌లు",
        tab_ai: "ద్వి-కాల మార్పు విశ్లేషణ", tab_map: "GIS మౌలిక సదుపాయాల పటం",
        badge_awaiting: "వేచి ఉంది", badge_complete: "విశ్లేషణ పూర్తయింది",
        m_platform: "ప్లాట్‌ఫారమ్:", m_conf: "ఖచ్చితత్వం:", m_area: "ప్రభావిత ప్రాంతం:", m_threat: "ప్రమాద స్థాయి:",
        panel3_title: "03 / నిర్ణయ మద్దతు నివేదిక",
        standby_status: "సిద్ధంగా ఉంది", standby_desc: "వ్యవస్థ ఉపగ్రహ సిగ్నల్ కోసం వేచి ఉంది.",
        lbl_evac: "తరలింపు ఆదేశం:", evac_monitoring: "పర్యవేక్షణ",
        mesh_header: "5 మీటర్ల స్థానిక హెచ్చరిక నెట్‌వర్క్", mesh_active: "1 పరికరం క్రియాశీలంగా ఉంది",
        mesh_prox: "లక్ష్య దూరం:", mesh_status: "పరిధి:", mesh_zone: "పర్యవేక్షణ జోన్",
        lbl_actions: "వనరుల కేటాయింపు ప్రణాళిక:",
        action_1: "టెలిమెట్రీ కోసం వేచి ఉంది.", action_2: "డ్రోన్ బృందం సిద్ధంగా ఉంది.",
        btn_siren: "సైరన్ పరీక్ష", btn_print: "నివేదికను ముద్రించండి", btn_json: "JSON డౌన్‌లోడ్",
        modal_title: "5 మీటర్ల సమీప హెచ్చరిక",
        modal_sub: "పరికరం విపత్తు ప్రాంతానికి 5 మీటర్ల లోపల ఉంది",
        modal_crit: "వెంటనే సురక్షిత ప్రాంతానికి వెళ్ళండి",
        modal_body: "తీవ్రమైన విపత్తును ఉపగ్రహం గుర్తించింది. వెంటనే సురక్షిత ప్రాంతానికి తరలి వెళ్లండి.",
        spoken_alert: "అత్యవసర హెచ్చరిక. ఐదు మీటర్ల పరిధిలో ప్రమాదం గుర్తించబడింది. వెంటనే సురక్షిత ప్రాంతానికి వెళ్ళండి."
    },
    bn: {
        code: "bn-IN",
        header_sub: "উপগ্রহ ভিত্তিক স্বয়ংক্রিয় দুর্যোগ গোয়েন্দা প্ল্যাটফর্ম",
        p1: "উপগ্রহ তথ্য গ্রহণ", p2: "রেডিওমেট্রিক ক্যালিব্রেশন", p3: "স্পেকট্রাল ম্যাপিং",
        p4: "এআই দুর্যোগ সনাক্তকরণ", p5: "তীব্রতা ও ক্ষয়ক্ষতি মূল্যায়ন", p6: "দ্রুত সিদ্ধান্ত সহায়তা",
        panel1_title: "০১ / টেলিমেট্রি ও মোবাইল ইনপুট",
        lbl_sensor: "সেন্সর মোড:", lbl_disaster: "দুর্যোগের ধরন:",
        btn_execute: "এআই বিশ্লেষণ শুরু করুন", lbl_logs: "রিয়েল-টাইম লগ",
        tab_ai: "দ্বি-কালিক পরিবর্তন সনাক্তকরণ", tab_map: "জিআইএস অবকাঠামো ও উদ্ধার মানচিত্র",
        badge_awaiting: "অপেক্ষারত", badge_complete: "বিশ্লেষণ সম্পন্ন",
        m_platform: "প্ল্যাটফর্ম:", m_conf: "নির্ভুলতা:", m_area: "ক্ষতিগ্রস্ত এলাকা:", m_threat: "ঝুঁকির মাত্রা:",
        panel3_title: "০৩ / সিদ্ধান্ত সহায়তা রিপোর্ট",
        standby_status: "স্ট্যান্ডবাই অবস্থা", standby_desc: "সিস্টেম প্রস্তুত। উপগ্রহ তথ্যের অপেক্ষায় রয়েছে।",
        lbl_evac: "স্থানান্তর নির্দেশ:", evac_monitoring: "সক্রিয় পর্যবেক্ষণ",
        mesh_header: "৫ মিটার রেসপন্ডার নেটওয়ার্ক", mesh_active: "১টি ডিভাইস সক্রিয়",
        mesh_prox: "দূরত্ব:", mesh_status: "পরিসীমা:", mesh_zone: "পর্যবেক্ষণ এলাকা",
        lbl_actions: "সম্পদ বরাদ্দ পরিকল্পনা:",
        action_1: "টেলিমেট্রির অপেক্ষায় রয়েছে।", action_2: "ড্রোন দল প্রস্তুত রয়েছে।",
        btn_siren: "জরুরি সাইরেন বাজান", btn_print: "রিপোর্ট প্রিন্ট করুন", btn_json: "JSON ডাউনলোড করুন",
        modal_title: "৫ মিটার স্থানীয় জরুরি সতর্কতা",
        modal_sub: "ডিভাইসটি দুর্যোগ অঞ্চলের ৫ মিটারের মধ্যে রয়েছে",
        modal_crit: "অবিলম্বে নিরাপদ স্থানে যান",
        modal_body: "উপগ্রহ বিশ্লেষণে মারাত্মক দুর্যোগ সনাক্ত হয়েছে। অবিলম্বে নিরাপদ আশ্রয়ে চলে যান।",
        spoken_alert: "জরুরি সতর্কতা। পাঁচ মিটারের মধ্যে দুর্যোগ সনাক্ত হয়েছে। অবিলম্বে নিরাপদ স্থানে যান।"
    },
    or: {
        code: "or-IN",
        header_sub: "ଉପଗ୍ରହ ଆଧାରିତ ସ୍ୱୟଂଚାଳିତ ବିପର୍ଯ୍ୟୟ ଗୁଇନ୍ଦା ପ୍ଲାଟଫର୍ମ",
        p1: "ଉପଗ୍ରହ ତଥ୍ୟ ଗ୍ରହଣ", p2: "ରେଡିଓମେଟ୍ରିକ ସଂଶୋଧନ", p3: "ସ୍ପେକ୍ଟ୍ରାଲ ମ୍ୟାପିଂ",
        p4: "AI ବିପର୍ଯ୍ୟୟ ଚିହ୍ନଟ", p5: "ତୀବ୍ରତା ମୂଲ୍ୟାଙ୍କନ", p6: "ତ୍ୱରିତ ନିଷ୍ପତ୍ତି ସହାୟତା",
        panel1_title: "୦୧ / ଟେଲିମେଟ୍ରି ଏବଂ ମୋବାଇଲ୍ ଇନପୁଟ୍",
        lbl_sensor: "ସେନ୍ସର ମୋଡ୍:", lbl_disaster: "ବିପର୍ଯ୍ୟୟ ବର୍ଗ:",
        btn_execute: "AI ବିଶ୍ଳେଷଣ ଆରମ୍ଭ କରନ୍ତୁ", lbl_logs: "ରିଅଲ-ଟାଇମ୍ ଲଗ୍",
        tab_ai: "ଦ୍ୱି-କାଳୀନ ପରିବର୍ତ୍ତନ ଚିହ୍ନଟ", tab_map: "GIS ଭିତ୍ତିଭୂମି ଓ ସ୍ଥାନାନ୍ତର ମାନଚିତ୍ର",
        badge_awaiting: "ଅପେକ୍ଷାରତ", badge_complete: "ବିଶ୍ଳେଷଣ ସମ୍ପନ୍ନ",
        m_platform: "ପ୍ଲାଟଫର୍ମ:", m_conf: "ସଠିକତା:", m_area: "ପ୍ରଭାବିତ ଅଞ୍ଚଳ:", m_threat: "ବିପଦ ସ୍ତର:",
        panel3_title: "୦୩ / ନିଷ୍ପତ୍ତି ସହାୟତା ରିପୋର୍ଟ",
        standby_status: "ପ୍ରସ୍ତୁତ ସ୍ଥିତି", standby_desc: "ସିଷ୍ଟମ୍ ଉପଗ୍ରହ ତଥ୍ୟ ପାଇଁ ଅପେକ୍ଷା କରିଛି।",
        lbl_evac: "ସ୍ଥାନାନ୍ତର ନିର୍ଦ୍ଦେଶ:", evac_monitoring: "ନିରୀକ୍ଷଣ",
        mesh_header: "୫ ମିଟର ସତର୍କତା ନେଟୱାର୍କ", mesh_active: "୧ଟି ଡିଭାଇସ୍ ସକ୍ରିୟ",
        mesh_prox: "ଲକ୍ଷ୍ୟ ଦୂରତା:", mesh_status: "ସୁରକ୍ଷା ବଳୟ:", mesh_zone: "ନିରୀକ୍ଷଣ ଅଞ୍ଚଳ",
        lbl_actions: "ସମ୍ବଳ ଆବଣ୍ଟନ ଯୋଜନା:",
        action_1: "ଟେଲିମେଟ୍ରି ତଥ୍ୟ ପାଇଁ ଅପେକ୍ଷା।", action_2: "ଡ୍ରୋନ୍ ଟିମ୍ ପ୍ରସ୍ତୁତ ଅଛି।",
        btn_siren: "ସାଇରନ୍ ବଜାନ୍ତୁ", btn_print: "ରିପୋର୍ଟ ପ୍ରିଣ୍ଟ୍ କରନ୍ତୁ", btn_json: "JSON ଡାଉନଲୋଡ୍",
        modal_title: "୫ ମିଟର ନିକଟତର ଜରୁରୀ ସତର୍କତା",
        modal_sub: "ଡିଭାଇସ୍ ବିପର୍ଯ୍ୟୟ ସ୍ଥଳର ୫ ମିଟର ମଧ୍ୟରେ ଅବସ୍ଥିତ",
        modal_crit: "ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ",
        modal_body: "ଉପଗ୍ରହ ବିଶ୍ଳେଷଣରୁ ଗମ୍ଭୀର ବିପର୍ଯ୍ୟୟ ଚିହ୍ନଟ ହୋଇଛି। ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଚାଲିଯାଆନ୍ତୁ।",
        spoken_alert: "ଜରୁରୀ ସତର୍କତା। ପାଞ୍ଚ ମିଟର ଦୂରତାରେ ବିପଦ ଚିହ୍ନଟ ହୋଇଛି। ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।"
    }
};

function changeLanguage(langKey) {
    currentLanguage = langKey;
    const dict = translations[langKey] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (dict[key]) elem.innerText = dict[key];
    });
}

function speakRegionalAlert() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const dict = translations[currentLanguage] || translations.en;
    const utterance = new SpeechSynthesisUtterance(dict.spoken_alert);
    utterance.lang = dict.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
}

// ---------------- GIS & CRITICAL INFRASTRUCTURE ENGINE ---------------- //
const geoProfiles = {
    WILDFIRE: {
        lat: 21.65, lng: 86.35, name: "Simlipal Biosphere Reserve (Thermal Front)", zoom: 12,
        infra: [
            { name: "Sector 3 Base Hospital", lat: 21.67, lng: 86.32, type: "hospital" },
            { name: "Substation 220kV Grid", lat: 21.63, lng: 86.37, type: "power" },
            { name: "North Highland Staging Zone", lat: 21.70, lng: 86.30, type: "shelter" }
        ],
        evacRoute: [[21.65, 86.35], [21.68, 86.33], [21.70, 86.30]]
    },
    FLOOD: {
        lat: 26.20, lng: 92.93, name: "Assam Brahmaputra Valley (Inundation Extent)", zoom: 11,
        infra: [
            { name: "District Civil Trauma Center", lat: 26.22, lng: 92.90, type: "hospital" },
            { name: "Hydro Power Switching Unit", lat: 26.18, lng: 92.95, type: "power" },
            { name: "Elevated Defense Relief Hub", lat: 26.25, lng: 92.88, type: "shelter" }
        ],
        evacRoute: [[26.20, 92.93], [26.23, 92.91], [26.25, 92.88]]
    },
    CYCLONE: {
        lat: 17.68, lng: 83.21, name: "Bay of Bengal Coastal Corridor", zoom: 10,
        infra: [
            { name: "Coastal Naval Hospital", lat: 17.72, lng: 83.18, type: "hospital" },
            { name: "Port Transmission Terminal", lat: 17.65, lng: 83.25, type: "power" },
            { name: "Inland Highground Shelter", lat: 17.78, lng: 83.12, type: "shelter" }
        ],
        evacRoute: [[17.68, 83.21], [17.74, 83.16], [17.78, 83.12]]
    },
    LANDSLIDE: {
        lat: 30.14, lng: 79.29, name: "Chamoli Himalayan Fault Zone", zoom: 13,
        infra: [
            { name: "Alpine Medical Outpost", lat: 30.16, lng: 79.27, type: "hospital" },
            { name: "Valley Micro-Hydel Plant", lat: 30.12, lng: 79.31, type: "power" },
            { name: "Ridge Safe Helipad Zone", lat: 30.18, lng: 79.25, type: "shelter" }
        ],
        evacRoute: [[30.14, 79.29], [30.16, 79.27], [30.18, 79.25]]
    }
};

function initMap() {
    if (gisMap) return;
    const defaultLoc = geoProfiles.WILDFIRE;
    gisMap = L.map('gisMap').setView([defaultLoc.lat, defaultLoc.lng], defaultLoc.zoom);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; ISRO/Cartosat Downlink',
        maxZoom: 17
    }).addTo(gisMap);

    renderMapInfrastructure(defaultLoc);
}

function renderMapInfrastructure(profile) {
    if (currentGeoCircle) gisMap.removeLayer(currentGeoCircle);
    mapMarkers.forEach(m => gisMap.removeLayer(m));
    mapMarkers = [];
    if (evacRouteLine) gisMap.removeLayer(evacRouteLine);

    currentGeoCircle = L.circle([profile.lat, profile.lng], {
        color: '#ff1e56',
        fillColor: '#ff1e56',
        fillOpacity: 0.35,
        radius: 8000
    }).addTo(gisMap).bindPopup(`<b>ACTIVE HAZARD CORRIDOR</b><br>${profile.name}`);

    profile.infra.forEach(item => {
        let iconHtml = item.type === "hospital" ? "🏥" : item.type === "power" ? "⚡" : "🛡️";
        let marker = L.marker([item.lat, item.lng], {
            icon: L.divIcon({
                className: 'custom-map-icon',
                html: `<div style="font-size: 20px; text-shadow: 0 0 10px #000;">${iconHtml}</div>`,
                iconSize: [24, 24]
            })
        }).addTo(gisMap).bindPopup(`<b>${item.name}</b><br>Type: ${item.type.toUpperCase()}`);
        mapMarkers.push(marker);
    });

    evacRouteLine = L.polyline(profile.evacRoute, {
        color: '#00ffaa',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9
    }).addTo(gisMap).bindPopup("<b>AUTOMATED DYNAMIC EVACUATION CORRIDOR</b><br>Active Bypass Around Hazard Polygon");
}

function updateTargetCoordinates() {
    const disasterType = document.getElementById("disasterTypeSelect").value;
    const profile = geoProfiles[disasterType] || geoProfiles.WILDFIRE;
    if (gisMap) {
        gisMap.setView([profile.lat, profile.lng], profile.zoom);
        renderMapInfrastructure(profile);
    }
}

function switchCenterView(viewType) {
    const aiBox = document.getElementById("aiViewContainer");
    const mapBox = document.getElementById("mapViewContainer");
    const smsBox = document.getElementById("smsViewContainer");
    const btnAi = document.getElementById("btnViewAi");
    const btnMap = document.getElementById("btnViewMap");
    const btnSms = document.getElementById("btnViewSms");

    aiBox.classList.add("hidden");
    mapBox.classList.add("hidden");
    smsBox.classList.add("hidden");
    btnAi.classList.remove("active");
    btnMap.classList.remove("active");
    btnSms.classList.remove("active");

    if (viewType === 'ai') {
        aiBox.classList.remove("hidden");
        btnAi.classList.add("active");
    } else if (viewType === 'map') {
        mapBox.classList.remove("hidden");
        btnMap.classList.add("active");
        if (!gisMap) {
            setTimeout(initMap, 100);
        } else {
            gisMap.invalidateSize();
        }
    } else if (viewType === 'sms') {
        smsBox.classList.remove("hidden");
        btnSms.classList.add("active");
    }
}

// ---------------- BI-TEMPORAL SWIPE-SLIDER INTERACTIVITY ---------------- //
function initSwipeSlider() {
    const wrapper = document.getElementById("sliderWrapper");
    const handle = document.getElementById("splitHandle");
    const afterLayer = document.getElementById("afterLayer");
    let isDragging = false;

    function setPosition(x) {
        const rect = wrapper.getBoundingClientRect();
        let posX = x - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;
        const pct = (posX / rect.width) * 100;
        handle.style.left = `${pct}%`;
        afterLayer.style.width = `${pct}%`;
    }

    handle.addEventListener("mousedown", () => { isDragging = true; });
    window.addEventListener("mouseup", () => { isDragging = false; });
    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        setPosition(e.clientX);
    });

    handle.addEventListener("touchstart", () => { isDragging = true; });
    window.addEventListener("touchend", () => { isDragging = false; });
    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        setPosition(e.touches[0].clientX);
    });
}

// ---------------- AUDIO & PREVIEW HANDLERS ---------------- //
function playFuturisticSiren() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sirenActive) return;

    sirenActive = true;
    sirenOsc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    sirenOsc.type = "sawtooth";
    sirenOsc.frequency.setValueAtTime(420, audioCtx.currentTime);
    sirenOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.6);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    sirenOsc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    sirenOsc.start();

    sirenOsc.onended = () => { sirenActive = false; };
}

function toggleSiren() {
    playFuturisticSiren();
    setTimeout(() => {
        if (sirenOsc) { sirenOsc.stop(); sirenActive = false; }
    }, 2200);
}

function previewPostImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("rawPreviewImg").src = e.target.result;
            document.getElementById("processedPreview").src = e.target.result;
            document.getElementById("liveBadge").innerText = "POST-RASTER LOADED";
            document.getElementById("liveBadge").style.color = "#00e5ff";
        };
        reader.readAsDataURL(file);
    }
}

function triggerNearbyDeviceAlert(distanceMeters) {
    const modal = document.getElementById("proximityAlertModal");
    const modalDist = document.getElementById("modalDist");
    
    modalDist.innerText = `${distanceMeters} m`;
    modal.classList.remove("hidden");

    if ("vibrate" in navigator) {
        navigator.vibrate([400, 200, 400, 200, 800]);
    }
    
    playFuturisticSiren();
    speakRegionalAlert();
}

function dismissProximityAlert() {
    document.getElementById("proximityAlertModal").classList.add("hidden");
    if (sirenOsc) {
        sirenOsc.stop();
        sirenActive = false;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// ---------------- CELLULAR BROADCAST CARDS RENDERER ---------------- //
function renderCellBroadcastCards(capPayload) {
    const grid = document.getElementById("smsCardsGrid");
    const status = document.getElementById("smsBroadcastStatus");
    const recipients = capPayload.info.dispatched_recipients || [];

    status.innerText = `GATEWAY: ${capPayload.gateway_mode} (${recipients.length} NODES)`;
    status.style.color = capPayload.gateway_mode === "LIVE_GATEWAY" ? "#00e5ff" : "#00ffaa";
    grid.innerHTML = "";

    recipients.forEach(r => {
        const card = document.createElement("div");
        card.className = "phone-sms-card";
        card.innerHTML = `
            <div class="phone-header">
                <span>📱 ${r.name} (${r.role})</span>
                <span style="color:#00ffaa;">${r.status}</span>
            </div>
            <div><span>Tel:</span> ${r.phone} | <span>Sector:</span> ${r.sector}</div>
            <div class="phone-msg">
                <b>[DIRECTIVE]:</b> ${r.message}
            </div>
            <div class="phone-actions">
                <span style="font-size: 9px; color: #64748b;">Ref SID: ${r.sid}</span>
                <a href="${r.whatsapp_direct_link}" target="_blank" class="wa-link-btn">💬 OPEN WHATSAPP DISPATCH</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ---------------- MAIN AI PIPELINE EXECUTION ---------------- //
async function runPipeline() {
    const fileInputPost = document.getElementById("imageInputPost");
    const fileInputPre = document.getElementById("imageInputPre");
    const fileContacts = document.getElementById("contactsCsvInput");
    const disasterType = document.getElementById("disasterTypeSelect").value;
    const sensorMode = document.getElementById("sensorSelect").value;
    const windSpeed = document.getElementById("windSlider").value;
    const rainfallRate = document.getElementById("rainSlider").value;
    const logs = document.getElementById("telemetryLogs");

    if (!fileInputPost.files[0]) {
        alert("Please select a Post-Disaster satellite raster first!");
        return;
    }

    logs.innerHTML += `<p class="log">> [01:INGEST] Downlinking ${sensorMode} orbital telemetry...</p>`;
    
    for (let i = 1; i <= 6; i++) {
        await new Promise(r => setTimeout(r, 160));
        document.querySelectorAll('.pipe-node').forEach(n => n.classList.remove('active'));
        document.getElementById(`p${i}`).classList.add('active');
        if (i === 2) logs.innerHTML += `<p class="log">> [02:CAL] Applied Radiometric Calibration & CLAHE...</p>`;
        if (i === 3) logs.innerHTML += `<p class="log">> [03:INDEX] Radiometric Tensor & Atmospheric Vectoring computed...</p>`;
    }

    const formData = new FormData();
    formData.append("file_post", fileInputPost.files[0]);
    if (fileInputPre && fileInputPre.files[0]) {
        formData.append("file_pre", fileInputPre.files[0]);
    }
    if (fileContacts && fileContacts.files[0]) {
        formData.append("file_contacts_csv", fileContacts.files[0]);
    }
    formData.append("disaster_type", disasterType);
    formData.append("sensor_mode", sensorMode);
    formData.append("wind_speed", windSpeed);
    formData.append("rainfall_rate", rainfallRate);
    formData.append("twilio_sid", document.getElementById("twilioSid") ? document.getElementById("twilioSid").value : "");
    formData.append("twilio_token", document.getElementById("twilioToken") ? document.getElementById("twilioToken").value : "");
    formData.append("twilio_from", document.getElementById("twilioFrom") ? document.getElementById("twilioFrom").value : "");

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (data.status === "SUCCESS") {
            latestAnalysisData = data;
            const res = data.pipeline_result;
            const ds = res.decision_support;
            const dict = translations[currentLanguage] || translations.en;

            // Update Bi-Temporal Slider
            document.getElementById("rawPreviewImg").src = res.post_raw_base64;
            document.getElementById("processedPreview").src = res.overlay_image_base64;
            document.getElementById("spectralMetricBadge").innerText = res.primary_metric;
            document.getElementById("deltaMetricBadge").innerText = res.delta_metric;
            
            // Numerical Tensors
            document.getElementById("confidenceVal").innerText = res.confidence_score;
            document.getElementById("affectedArea").innerText = ds.estimated_impact_area;
            document.getElementById("threatLevel").innerText = res.severity;
            document.getElementById("threatLevel").style.color = res.urgency_color;
            document.getElementById("satName").innerText = data.telemetry.satellite.split('/')[0];
            document.getElementById("liveBadge").innerText = dict.badge_complete;
            document.getElementById("liveBadge").style.color = "#00ffaa";

            // Dossier Directives
            document.getElementById("alertTitle").innerText = res.severity;
            document.getElementById("alertTitle").style.color = res.urgency_color;
            document.getElementById("alertDesc").innerText = `Signature: ${res.disaster_type}`;
            document.getElementById("evacStatus").innerText = ds.evacuation_priority;
            document.getElementById("evacStatus").style.color = res.urgency_color;

            // 5m Proximity UI
            document.getElementById("deviceStatus").innerText = "IMPACT PERIMETER (<= 5m)";
            document.getElementById("deviceStatus").style.color = "#ff1e56";

            // Render Cellular SMS Broadcast console cards
            renderCellBroadcastCards(res.cap_telecom_payload);

            // Resource Directives
            const list = document.getElementById("resourceList");
            list.innerHTML = "";
            ds.resource_allocation.forEach(item => {
                const li = document.createElement("li");
                li.innerText = item;
                list.appendChild(li);
            });

            logs.innerHTML += `<p class="log">> [04:AI] Anomaly classified: ${res.disaster_type}</p>`;
            logs.innerHTML += `<p class="log">> [05:IMPACT] Footprint estimated at ${ds.estimated_impact_area} (Multiplier: ${res.simulation_params.spread_multiplier}x)</p>`;
            logs.innerHTML += `<p class="log">> [06:CAP] Dispatched ITU-T alert to ${ds.recipients_count} mobile responder nodes.</p>`;
            logs.scrollTop = logs.scrollHeight;

            if (ds.siren_trigger) {
                toggleSiren();
                setTimeout(() => {
                    triggerNearbyDeviceAlert(2.4);
                }, 1000);
            }
        }
    } catch (err) {
        logs.innerHTML += `<p class="log" style="color:#ff1e56">> [ERROR] Pipeline fault: ${err.message}</p>`;
    }
}

// ---------------- EXPORT DOSSIERS ---------------- //
function exportMissionDossier() {
    if (!latestAnalysisData) {
        alert("Run an AI inference cycle before exporting the mission dossier.");
        return;
    }

    const dossierContent = {
        project: "Q-OPTIMA SENTINEL",
        lead_researcher: "Mr. Aniket Deo",
        language_jurisdiction: currentLanguage.toUpperCase(),
        classification: "DEFENSE DISASTER INCIDENT DOSSIER",
        timestamp: new Date().toISOString(),
        telemetry: latestAnalysisData.telemetry,
        cap_telecom_broadcast_payload: latestAnalysisData.pipeline_result.cap_telecom_payload,
        ai_assessment: {
            disaster_type: latestAnalysisData.pipeline_result.disaster_type,
            confidence: latestAnalysisData.pipeline_result.confidence_score,
            primary_metric: latestAnalysisData.pipeline_result.primary_metric,
            delta_change_tensor: latestAnalysisData.pipeline_result.delta_metric,
            kinetics: latestAnalysisData.pipeline_result.kinetics,
            simulation_parameters: latestAnalysisData.pipeline_result.simulation_params,
            severity_level: latestAnalysisData.pipeline_result.severity,
            impact_area: latestAnalysisData.pipeline_result.decision_support.estimated_impact_area
        },
        decision_support_directive: latestAnalysisData.pipeline_result.decision_support
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossierContent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SENTINEL_MISSION_REPORT_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function generateMissionBriefingPDF() {
    if (!latestAnalysisData) {
        alert("Please run an AI inference cycle first!");
        return;
    }

    const t = latestAnalysisData.telemetry;
    const r = latestAnalysisData.pipeline_result;
    const ds = r.decision_support;
    const cap = r.cap_telecom_payload;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Q-OPTIMA SENTINEL - MISSION REPORT</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
                .header { border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; letter-spacing: 1px; }
                .meta { font-size: 12px; color: #555; }
                .section { margin-top: 25px; }
                .section-title { font-size: 14px; font-weight: bold; background: #eee; padding: 5px 10px; margin-bottom: 10px; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 13px; }
                td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f9f9f9; }
                .critical { color: #d32f2f; font-weight: bold; }
                .footer { margin-top: 50px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; color: #777; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Q-OPTIMA SENTINEL // INCIDENT COMMAND BRIEFING</div>
                <div class="meta">DEFENSE & DISASTER RESPONSE DIRECTIVE | RESTRICTED TIER-1</div>
                <div class="meta">Lead Researcher: <b>Mr. Aniket Deo</b> | Date: ${new Date().toUTCString()}</div>
                <div class="meta">C-DOT / ITU-T CAP Payload ID: <b>${cap.identifier}</b></div>
            </div>

            <div class="section">
                <div class="section-title">1. Satellite Telemetry & Ingestion Profile</div>
                <table>
                    <tr><th>Sensor System</th><td>${t.satellite}</td></tr>
                    <tr><th>Downlink Station</th><td>${t.downlink_node}</td></tr>
                    <tr><th>Polarization & Band</th><td>${t.band_config}</td></tr>
                    <tr><th>Ground Sampling Distance</th><td>${t.polarization}</td></tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">2. AI Damage Diagnostics & Energetics</div>
                <table>
                    <tr><th>Detected Signature</th><td><b>${r.disaster_type}</b></td></tr>
                    <tr><th>Spectral Confidence Index</th><td><b>${r.confidence_score}</b></td></tr>
                    <tr><th>Threat Classification</th><td class="critical">${r.severity}</td></tr>
                    <tr><th>Quantitative Area Footprint</th><td><b>${ds.estimated_impact_area}</b></td></tr>
                    <tr><th>Remote Sensing Metric</th><td>${r.primary_metric}</td></tr>
                    <tr><th>Bi-Temporal Delta Change</th><td>${r.delta_metric}</td></tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">3. Tactical Dispatch & Cellular Alert Reach</div>
                <table>
                    <tr><th>Evacuation Priority</th><td><b>${ds.evacuation_priority}</b></td></tr>
                    <tr><th>Cellular Broadcast Nodes</th><td><b>${ds.recipients_count} Field Responders Notified</b></td></tr>
                    <tr><th>Directives</th><td>
                        <ul>${ds.resource_allocation.map(a => `<li>${a}</li>`).join('')}</ul>
                    </td></tr>
                    <tr><th>Safe Extraction Zones</th><td>${ds.safe_assembly_zones.join(', ')}</td></tr>
                </table>
            </div>

            <div class="footer">
                Q-OPTIMA SENTINEL SYSTEM ARCHITECTURE © 2026 Researched & Developed by Mr. Aniket Deo.<br>
                Certified for ISRO Disaster Management Support Programme (DMSP) Interoperability.
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 500);
}

window.onload = () => { 
    initMap();
    initSwipeSlider();
};