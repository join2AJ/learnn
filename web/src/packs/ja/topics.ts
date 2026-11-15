/** Topic packs: words grouped by theme (tags come from scripts/add_jlpt_topics.py). */
export const TOPICS: { id: string; name: string; hi: string; icon: string; tone: string }[] = [
  { id: "phrases", name: "Everyday expressions", hi: "रोज़ के वाक्यांश", icon: "chat", tone: "shu" },
  { id: "people", name: "Family & people", hi: "परिवार और लोग", icon: "users", tone: "sakura" },
  { id: "food", name: "Food & drink", hi: "खाना-पीना", icon: "food", tone: "gold" },
  { id: "time", name: "Time & calendar", hi: "समय और कैलेंडर", icon: "timer", tone: "ai" },
  { id: "numbers", name: "Numbers & counting", hi: "संख्याएँ", icon: "hourglass", tone: "plum" },
  { id: "travel", name: "Travel & places", hi: "यात्रा और जगहें", icon: "train", tone: "matcha" },
  { id: "home", name: "Home & daily life", hi: "घर और दिनचर्या", icon: "landmark", tone: "gold" },
  { id: "school", name: "School & study", hi: "स्कूल और पढ़ाई", icon: "grad", tone: "ai" },
  { id: "work", name: "Work & business", hi: "काम और व्यापार", icon: "briefcase", tone: "plum" },
  { id: "shopping", name: "Shopping & money", hi: "ख़रीदारी और पैसा", icon: "shop", tone: "shu" },
  { id: "body", name: "Body & health", hi: "शरीर और सेहत", icon: "heartHand", tone: "sakura" },
  { id: "nature", name: "Nature & weather", hi: "प्रकृति और मौसम", icon: "flower", tone: "matcha" },
  { id: "feelings", name: "Feelings", hi: "भावनाएँ", icon: "heart", tone: "shu" },
  { id: "describe", name: "Colours & describing", hi: "रंग और वर्णन", icon: "sparkles", tone: "gold" },
  { id: "media", name: "Tech & media", hi: "तकनीक और मीडिया", icon: "media", tone: "ai" },
];
export const JLPT_INFO: Record<number, { name: string; desc: string; hi: string }> = {
  5: { name: "N5", desc: "Beginner - basic phrases and everyday words", hi: "शुरुआती" },
  4: { name: "N4", desc: "Elementary - daily conversation, slowly", hi: "प्रारंभिक" },
  3: { name: "N3", desc: "Intermediate - everyday situations", hi: "मध्यम" },
  2: { name: "N2", desc: "Upper intermediate - news, work", hi: "उच्च मध्यम" },
  1: { name: "N1", desc: "Advanced - complex Japanese", hi: "उन्नत" },
};
