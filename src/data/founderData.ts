export interface FounderOffering {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: 'structured' | 'free' | 'pathways' | 'literacy';
}

export interface FounderData {
  name: string;
  roleEn: string;
  roleHi: string;
  taglineEn: string;
  taglineHi: string;
  welcomeHeadlineEn: string;
  welcomeHeadlineHi: string;
  personalQuoteEn: string;
  personalQuoteHi: string;
  introParagraphsEn: string[];
  introParagraphsHi: string[];
  offeringsTitleEn: string;
  offeringsTitleHi: string;
  offeringsSubtitleEn: string;
  offeringsSubtitleHi: string;
  offerings: FounderOffering[];
  closingNoteEn: string;
  closingNoteHi: string;
  ctaButtonEn: string;
  ctaButtonHi: string;
}

export const FOUNDER_CONTENT: FounderData = {
  name: 'Amitava Sen',
  roleEn: 'Founder & Lead Educator',
  roleHi: 'Founder aur Lead Educator',
  taglineEn: 'Pianotastic Academy',
  taglineHi: 'Pianotastic Academy',
  welcomeHeadlineEn: 'Welcome to Pianotastic Academy',
  welcomeHeadlineHi: 'Pianotastic Academy Me Aapka Swagat Hai',
  personalQuoteEn: '“Let me personally introduce you to the academy and how you can begin your musical journey.”',
  personalQuoteHi: '“Aaiye main personally aapko academy aur aapki musical journey se introduce karata hoon.”',
  introParagraphsEn: [
    'I created Pianotastic Academy with a sincere mission: to make authentic piano and music education structured, accessible, and deeply joyful for every learner.',
    'Learning piano should never feel overwhelming or confusing. Here, you learn with methodical step-by-step guidance designed to develop genuine musical ears, confident finger dexterity, and heartfelt musical expression.',
    'As a public visitor, you are warmly invited to explore our free learning resources, watch our foundational lessons, and discover our teaching approach completely at your own pace before deciding on enrollment.',
  ],
  introParagraphsHi: [
    'Maine Pianotastic Academy ki shuruaat ek vishwas ke sath ki: piano aur sangeet ki authentic shiksha har learner ke liye structured, saral aur anandmayi honi chahiye.',
    'Piano seekhna kabhi bhi mushkil ya confusing nahi lagna chahiye. Yahan aap step-by-step guidance ke sath seekhte hain, jisse aapka musical ear, sahi technique aur dil se bajane ka anubhav viksit hota hai.',
    'Ek visitor ke roop me, aapka hardik swagat hai. Aap bina kisi dabav ke humare free video lessons dekh sakte hain aur enroll karne se pehle academy ke tarike ko aaram se explore kar sakte hain.',
  ],
  offeringsTitleEn: 'What Pianotastic Academy Offers',
  offeringsTitleHi: 'Pianotastic Academy Me Kya Milta Hai',
  offeringsSubtitleEn: 'A complete, supportive musical ecosystem designed for lifelong learning.',
  offeringsSubtitleHi: 'Ek complete aur supportive musical mahol jo har learner ke sath khada hai.',
  offerings: [
    {
      id: 'structured',
      titleEn: 'Structured, Supportive Learning',
      titleHi: 'Structured aur Supportive Learning',
      descEn: 'Clear progression paths from basic key coordination to expressive pieces, with calm guidance every step of the way.',
      descHi: 'Basic key coordination se lekar expressive music tak, step-by-step calm aur clear guidance.',
      icon: 'structured',
    },
    {
      id: 'free',
      titleEn: 'Free Learning First',
      titleHi: 'Pehle Free Learning Explore Karein',
      descEn: 'Explore foundational lessons, posture tutorials, and note-reading guides freely before choosing any course.',
      descHi: 'Foundation lessons, posture aur note reading muft me explore karein, koi account ya payment zaroori nahi.',
      icon: 'free',
    },
    {
      id: 'pathways',
      titleEn: 'Dedicated Musical Pathways',
      titleHi: 'Alag-Alag Musical Pathways',
      descEn: 'Learn Western Classical music, popular songs, Rabindra Sangeet, and Bengali music through tailored pedagogical arrangements.',
      descHi: 'Western Classical, popular songs, Rabindra Sangeet aur Bengali sangeet — apne dil ki pasand chunein.',
      icon: 'pathways',
    },
    {
      id: 'literacy',
      titleEn: 'Pure Musical Literacy',
      titleHi: 'Music Theory & Notation Reading',
      descEn: 'Build true independence as a musician by learning to read sheet music and understand music theory naturally.',
      descHi: 'Sheet music reading aur music theory ko naturally seekh kar ek independent musician banein.',
      icon: 'literacy',
    },
  ],
  closingNoteEn: 'Take your time, enjoy exploring the free video lessons, and discover the joy of music.',
  closingNoteHi: 'Aaram se free video lessons explore karein aur piano bajane ka anand mehsoos karein.',
  ctaButtonEn: 'Continue to Free Learning',
  ctaButtonHi: 'Free Learning Me Aage Badhein',
};
