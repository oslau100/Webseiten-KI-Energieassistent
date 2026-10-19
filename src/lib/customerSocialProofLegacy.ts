/** Exact V3 copy compatibility until the separately approved template config is applied.
 * Source: T08 V3 template inventory, 2026-10-19, both customer locations / 12 locales.
 * Full-string matches only; no numeric guessing, translations or metric values originate here.
 */
export const legacyCustomerCountTemplates: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "de": {
    "Über 1.500 Haushalte nutzen bereits den digitalen Energieassistenten": "Über {customer_count} Haushalte nutzen bereits den digitalen Energieassistenten",
    "Über 1500 Haushalte nutzen bereits den digitalen Energieassistenten": "Über {customer_count} Haushalte nutzen bereits den digitalen Energieassistenten",
    "Über 2000 Haushalte nutzen bereits den digitalen Energieassistenten": "Über {customer_count} Haushalte nutzen bereits den digitalen Energieassistenten",
    "Mehr als 2.000 Haushalte nutzen den Energieassistenten bereits": "Mehr als {customer_count} Haushalte nutzen den Energieassistenten bereits",
    "Bereits 1.500+ zufriedene Nutzer in ganz Deutschland": "Bereits {customer_count}+ zufriedene Nutzer in ganz Deutschland",
    "Bereits 2.000+ zufriedene Nutzer in ganz Deutschland": "Bereits {customer_count}+ zufriedene Nutzer in ganz Deutschland",
    "Über 2.000 zufriedene Nutzer in ganz Deutschland": "Über {customer_count} zufriedene Nutzer in ganz Deutschland"
  },
  "en": {
    "Over 1,500 households already use the digital Energy Assistant": "Over {customer_count} households already use the digital Energy Assistant",
    "Over 1500 households already use the digital Energy Assistant": "Over {customer_count} households already use the digital Energy Assistant",
    "Over 2,000 households already use the digital Energy Assistant": "Over {customer_count} households already use the digital Energy Assistant",
    "More than 2,000 households already use the Energy Assistant": "More than {customer_count} households already use the Energy Assistant",
    "Already 1,500+ satisfied users across Germany": "Already {customer_count}+ satisfied users across Germany",
    "Already 2,000+ satisfied users across Germany": "Already {customer_count}+ satisfied users across Germany",
    "Over 2,000 satisfied users across Germany": "Over {customer_count} satisfied users across Germany"
  },
  "tr": {
    "1.500'den fazla hane dijital Enerji Asistanı'nı kullanıyor": "{customer_count}'den fazla hane dijital Enerji Asistanı'nı kullanıyor",
    "1500'den fazla hane dijital Enerji Asistanı'nı kullanıyor": "{customer_count}'den fazla hane dijital Enerji Asistanı'nı kullanıyor",
    "2.000'den fazla hane dijital Enerji Asistanını şimdiden kullanıyor": "{customer_count}'den fazla hane dijital Enerji Asistanını şimdiden kullanıyor",
    "2.000'den fazla hane Enerji Asistanını zaten kullanıyor": "{customer_count}'den fazla hane Enerji Asistanını zaten kullanıyor",
    "Almanya genelinde şimdiden 1.500+ memnun kullanıcı": "Almanya genelinde şimdiden {customer_count}+ memnun kullanıcı",
    "Almanya genelinde şimdiden 2.000+ memnun kullanıcı": "Almanya genelinde şimdiden {customer_count}+ memnun kullanıcı",
    "Almanya genelinde 2.000+ memnun kullanıcı": "Almanya genelinde {customer_count}+ memnun kullanıcı"
  },
  "ru": {
    "Цифровым Энергоассистентом уже пользуются более 1 500 домохозяйств": "Цифровым Энергоассистентом уже пользуются более {customer_count} домохозяйств",
    "Цифровым Энергоассистентом уже пользуются более 1500 домохозяйств": "Цифровым Энергоассистентом уже пользуются более {customer_count} домохозяйств",
    "Более 2 000 домохозяйств уже пользуются цифровым Энергоассистентом": "Более {customer_count} домохозяйств уже пользуются цифровым Энергоассистентом",
    "Более 2 000 домохозяйств уже используют Энергоассистент": "Более {customer_count} домохозяйств уже используют Энергоассистент",
    "Уже более 1 500 довольных пользователей по всей Германии": "Уже более {customer_count} довольных пользователей по всей Германии",
    "Уже 2 000+ довольных пользователей по всей Германии": "Уже {customer_count}+ довольных пользователей по всей Германии",
    "Более 2 000 довольных пользователей по всей Германии": "Более {customer_count} довольных пользователей по всей Германии"
  },
  "ar": {
    "أكثر من 1,500 أسرة تستخدم مساعد الطاقة الرقمي بالفعل": "أكثر من {customer_count} أسرة تستخدم مساعد الطاقة الرقمي بالفعل",
    "أكثر من 1500 أسرة تستخدم مساعد الطاقة الرقمي بالفعل": "أكثر من {customer_count} أسرة تستخدم مساعد الطاقة الرقمي بالفعل",
    "أكثر من 2,000 أسرة تستخدم بالفعل مساعد الطاقة الرقمي": "أكثر من {customer_count} أسرة تستخدم بالفعل مساعد الطاقة الرقمي",
    "أكثر من 2,000 أسرة تستخدم مساعد الطاقة بالفعل": "أكثر من {customer_count} أسرة تستخدم مساعد الطاقة بالفعل",
    "أكثر من 1,500 مستخدم راضٍ في جميع أنحاء ألمانيا": "أكثر من {customer_count} مستخدم راضٍ في جميع أنحاء ألمانيا",
    "بالفعل 2,000+ مستخدم راضٍ في جميع أنحاء ألمانيا": "بالفعل {customer_count}+ مستخدم راضٍ في جميع أنحاء ألمانيا",
    "أكثر من 2,000 مستخدم راضٍ في جميع أنحاء ألمانيا": "أكثر من {customer_count} مستخدم راضٍ في جميع أنحاء ألمانيا"
  },
  "it": {
    "Oltre 1.500 famiglie utilizzano già l'Assistente Energia digitale": "Oltre {customer_count} famiglie utilizzano già l'Assistente Energia digitale",
    "Oltre 1500 famiglie utilizzano già l'Assistente Energia digitale": "Oltre {customer_count} famiglie utilizzano già l'Assistente Energia digitale",
    "Oltre 2.000 famiglie usano già l'Assistente Energia digitale": "Oltre {customer_count} famiglie usano già l'Assistente Energia digitale",
    "Più di 2.000 famiglie usano già l'Assistente Energia": "Più di {customer_count} famiglie usano già l'Assistente Energia",
    "Già oltre 1.500 utenti soddisfatti in tutta la Germania": "Già oltre {customer_count} utenti soddisfatti in tutta la Germania",
    "Già 2.000+ utenti soddisfatti in tutta la Germania": "Già {customer_count}+ utenti soddisfatti in tutta la Germania",
    "Oltre 2.000 utenti soddisfatti in tutta la Germania": "Oltre {customer_count} utenti soddisfatti in tutta la Germania"
  },
  "zh": {
    "已有超过1,500个家庭使用数字能源助手": "已有超过{customer_count}个家庭使用数字能源助手",
    "已有超过1500个家庭使用数字能源助手": "已有超过{customer_count}个家庭使用数字能源助手",
    "已有超过 2,000 个家庭在使用数字能源助手": "已有超过 {customer_count} 个家庭在使用数字能源助手",
    "已有超过 2,000 个家庭在使用能源助手": "已有超过 {customer_count} 个家庭在使用能源助手",
    "德国各地已有 1,500 多名满意用户": "德国各地已有 {customer_count} 多名满意用户",
    "德国各地已有2,000+位满意用户": "德国各地已有{customer_count}+位满意用户",
    "德国各地已有 2,000+ 位满意用户": "德国各地已有 {customer_count}+ 位满意用户"
  },
  "hi": {
    "1,500 से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का इस्तेमाल कर रहे हैं": "{customer_count} से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का इस्तेमाल कर रहे हैं",
    "1500 से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का इस्तेमाल कर रहे हैं": "{customer_count} से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का इस्तेमाल कर रहे हैं",
    "2,000 से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का उपयोग कर रहे हैं": "{customer_count} से अधिक परिवार पहले से डिजिटल एनर्जी असिस्टेंट का उपयोग कर रहे हैं",
    "2,000 से अधिक परिवार पहले से एनर्जी असिस्टेंट का उपयोग कर रहे हैं": "{customer_count} से अधिक परिवार पहले से एनर्जी असिस्टेंट का उपयोग कर रहे हैं",
    "जर्मनी भर में पहले से ही 1,500+ संतुष्ट उपयोगकर्ता": "जर्मनी भर में पहले से ही {customer_count}+ संतुष्ट उपयोगकर्ता",
    "पूरे जर्मनी में पहले से ही 2,000+ संतुष्ट उपयोगकर्ता": "पूरे जर्मनी में पहले से ही {customer_count}+ संतुष्ट उपयोगकर्ता",
    "जर्मनी भर में 2,000+ संतुष्ट उपयोगकर्ता": "जर्मनी भर में {customer_count}+ संतुष्ट उपयोगकर्ता"
  },
  "es": {
    "Más de 1.500 hogares ya utilizan el Asistente Energético digital": "Más de {customer_count} hogares ya utilizan el Asistente Energético digital",
    "Más de 1500 hogares ya utilizan el Asistente Energético digital": "Más de {customer_count} hogares ya utilizan el Asistente Energético digital",
    "Más de 2.000 hogares ya usan el Asistente Energético digital": "Más de {customer_count} hogares ya usan el Asistente Energético digital",
    "Más de 2.000 hogares ya utilizan el Asistente Energético": "Más de {customer_count} hogares ya utilizan el Asistente Energético",
    "Más de 1.500 usuarios satisfechos en toda Alemania": "Más de {customer_count} usuarios satisfechos en toda Alemania",
    "Ya hay 2.000+ usuarios satisfechos en toda Alemania": "Ya hay {customer_count}+ usuarios satisfechos en toda Alemania",
    "Más de 2.000 usuarios satisfechos en toda Alemania": "Más de {customer_count} usuarios satisfechos en toda Alemania"
  },
  "fr": {
    "Plus de 1 500 foyers utilisent déjà l'Assistant Énergie numérique": "Plus de {customer_count} foyers utilisent déjà l'Assistant Énergie numérique",
    "Plus de 1500 foyers utilisent déjà l'Assistant Énergie numérique": "Plus de {customer_count} foyers utilisent déjà l'Assistant Énergie numérique",
    "Plus de 2 000 foyers utilisent déjà l'Assistant Énergie numérique": "Plus de {customer_count} foyers utilisent déjà l'Assistant Énergie numérique",
    "Plus de 2 000 foyers utilisent déjà l'Assistant Énergie": "Plus de {customer_count} foyers utilisent déjà l'Assistant Énergie",
    "Déjà plus de 1 500 utilisateurs satisfaits dans toute l’Allemagne": "Déjà plus de {customer_count} utilisateurs satisfaits dans toute l’Allemagne",
    "Déjà 2 000+ utilisateurs satisfaits dans toute l'Allemagne": "Déjà {customer_count}+ utilisateurs satisfaits dans toute l'Allemagne",
    "Plus de 2 000 utilisateurs satisfaits dans toute l'Allemagne": "Plus de {customer_count} utilisateurs satisfaits dans toute l'Allemagne"
  },
  "nl": {
    "Meer dan 1.500 huishoudens gebruiken de digitale Energieassistent al": "Meer dan {customer_count} huishoudens gebruiken de digitale Energieassistent al",
    "Meer dan 1500 huishoudens gebruiken de digitale Energieassistent al": "Meer dan {customer_count} huishoudens gebruiken de digitale Energieassistent al",
    "Meer dan 2.000 huishoudens gebruiken de digitale Energieassistent al": "Meer dan {customer_count} huishoudens gebruiken de digitale Energieassistent al",
    "Meer dan 2.000 huishoudens gebruiken de Energieassistent al": "Meer dan {customer_count} huishoudens gebruiken de Energieassistent al",
    "Al meer dan 1.500 tevreden gebruikers in heel Duitsland": "Al meer dan {customer_count} tevreden gebruikers in heel Duitsland",
    "Al 2.000+ tevreden gebruikers in heel Duitsland": "Al {customer_count}+ tevreden gebruikers in heel Duitsland",
    "Meer dan 2.000 tevreden gebruikers in heel Duitsland": "Meer dan {customer_count} tevreden gebruikers in heel Duitsland"
  },
  "pl": {
    "Ponad 1 500 gospodarstw domowych korzysta już z cyfrowego Asystenta Energii": "Ponad {customer_count} gospodarstw domowych korzysta już z cyfrowego Asystenta Energii",
    "Ponad 1500 gospodarstw domowych korzysta już z cyfrowego Asystenta Energii": "Ponad {customer_count} gospodarstw domowych korzysta już z cyfrowego Asystenta Energii",
    "Ponad 2 000 gospodarstw domowych już korzysta z cyfrowego Asystenta Energii": "Ponad {customer_count} gospodarstw domowych już korzysta z cyfrowego Asystenta Energii",
    "Ponad 2 000 gospodarstw domowych korzysta już z Asystenta Energii": "Ponad {customer_count} gospodarstw domowych korzysta już z Asystenta Energii",
    "Już ponad 1 500 zadowolonych użytkowników w całych Niemczech": "Już ponad {customer_count} zadowolonych użytkowników w całych Niemczech",
    "Już 2 000+ zadowolonych użytkowników w całych Niemczech": "Już {customer_count}+ zadowolonych użytkowników w całych Niemczech",
    "Ponad 2 000 zadowolonych użytkowników w całych Niemczech": "Ponad {customer_count} zadowolonych użytkowników w całych Niemczech"
  }
};
