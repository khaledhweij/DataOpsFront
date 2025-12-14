export type Language = "en" | "es" | "ar";

export const infoModalText: Record<Language, any> = {
    en: {
        title: "DataOps",
        intro1:
            "DataOps is an open-source, privacy-first toolbox for developers and professionals who work with data and documents every day.",
        intro2:
            "It replaces dozens of random online tools by bringing everything into one secure place - running entirely on your local machine, with no uploads, no tracking, and no data leaving your device.",
        intro3:
            "DataOps supports JSON, XML, EDI (Edifact), Base64, plain text, JWT, UUID, and PDF, offering powerful tools for comparison, transformation, validation, and document handling.",
        intro4:
            "Whether you are debugging APIs, cleaning data, manipulating PDFs, or managing daily tasks, DataOps helps you work faster without sacrificing privacy.",
        featuresTitle: "Key Features",
        features: [
            "Compare, Beautify, Convert, and Validate JSON, XML, TOON, EDI, and text contents.",
            "Text and PDF operations for daily productivity.",
            "API Tester with support for basic HTTP and cURL.",
            "Tasks Board for keep tracking of your daily tasks.",
        ],
        developedBy: "Developed By",
        contributions: "Contributions welcome at:",
        feedback: "Any feedback or suggestions? ",
        sendFeedback: "Send Feedback",
        licenced: "Licensed under ",
        version: "Version",
        close: "Close",
    },

    es: {
        title: "DataOps",
        intro1:
            "DataOps es una herramienta open-source y centrada en la privacidad para desarrolladores y profesionales que trabajan con datos y documentos a diario.",
        intro2:
            "Reemplaza decenas de herramientas online aleatorias al ofrecer todo en un solo lugar seguro, funcionando completamente en tu máquina local.",
        intro3:
            "DataOps soporta JSON, XML, EDI (Edifact), Base64, texto plano, JWT, UUID y PDF.",
        intro4:
            "Ya sea depurando APIs, limpiando datos o manipulando PDFs, DataOps te ayuda a trabajar más rápido sin sacrificar privacidad.",
        featuresTitle: "Funciones Principales",
        features: [
            "Comparar, formatear, convertir y validar datos.",
            "Operaciones de texto y PDF.",
            "Probador de APIs y comandos cURL.",
            "Tablero de tareas para llevar un registro de tus tareas diarias.",
        ],
        developedBy: "Desarrollado por",
        contributions: "Contribuciones bienvenidas en:",
        feedback: "¿Algún comentario o sugerencia? ",
        sendFeedback: "Enviar comentarios",
        licenced: "Licenciado bajo ",
        version: "Versión",
        close: "Cerrar",
    },

    ar: {
        title: "DataOps",
        intro1:
            "DataOps هي أداة مفتوحة المصدر تركز على الخصوصية للمطورين والمهنيين الذين يعملون مع البيانات والوثائق يوميًا.",
        intro2: 
            "تستبدل عشرات الأدوات العشوائية على الإنترنت من خلال توفير كل شيء في مكان واحد وآمن .",
        intro3:
            "تدعم JSON و XML و EDI و Base64 و JWT و UUID و PDF.",
        intro4:
            "سواء كنت تختبر APIs أو تتعامل مع ملفات PDF، تساعدك DataOps على العمل بسرعة دون المساس بالخصوصية.",
        featuresTitle: "الميزات الرئيسية",
        features: [
            "مقارنة وتنسيق وتحويل البيانات.",
            "عمليات النصوص و PDF.",
            "أداة اختبار API.",
            "لوحة المهام لتتبع مهامك اليومية.",
        ],
        developedBy: "تم التطوير بواسطة",
        contributions: "المساهمات مرحب بها في:",
        feedback: "هل لديك أي ملاحظات أو اقتراحات؟ ",
        sendFeedback: "إرسال الملاحظات",
        licenced: "مرخص بموجب ",
        version: "الإصدار",
        close: "إغلاق",
    },
};
