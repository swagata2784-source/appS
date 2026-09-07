import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Screen, Language, Theme, CategoryId, VideoLesson, RecordedCourse, MusicPathway, StudentAccount } from './types';
import { FREE_CATEGORIES, FREE_LESSONS } from './data/content';
import { RECORDED_COURSES } from './data/coursesData';
import { SplashScreen } from './components/SplashScreen';
import { TopBar } from './components/TopBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GoalSelectionScreen } from './components/GoalSelectionScreen';
import { FounderWelcomeScreen } from './components/FounderWelcomeScreen';
import { FreeLearningHomeScreen } from './components/FreeLearningHomeScreen';
import { CategoryVideoListScreen } from './components/CategoryVideoListScreen';
import { VideoPlayerScreen } from './components/VideoPlayerScreen';
import { PublicHomeScreen } from './components/PublicHomeScreen';
import { CoursesHomeScreen } from './components/CoursesHomeScreen';
import { RecordedCatalogueScreen } from './components/RecordedCatalogueScreen';
import { CourseDetailsScreen } from './components/CourseDetailsScreen';
import { EnrollmentInitiationScreen } from './components/EnrollmentInitiationScreen';
import { AccountCreationScreen } from './components/AccountCreationScreen';
import { EnrollmentSummaryScreen } from './components/EnrollmentSummaryScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { EnrollmentConfirmationScreen } from './components/EnrollmentConfirmationScreen';
import { StudentLoginScreen } from './components/StudentLoginScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { CreatePasswordScreen } from './components/CreatePasswordScreen';
import { StudentHomeScreen } from './components/StudentHomeScreen';
import { IndividualRecordedClassScreen } from './components/IndividualRecordedClassScreen';
import { SongLibraryScreen } from './components/SongLibraryScreen';
import { BooksModal } from './components/BooksModal';
import { ContactModal } from './components/ContactModal';
import { StructuredCoursesModal } from './components/StructuredCoursesModal';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('pianotastic_visitor_goal') || 'zero';
    } catch {
      return 'zero';
    }
  });
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>('beginner');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [sessionPlaybackTimes, setSessionPlaybackTimes] = useState<
    Record<string, number>
  >({});

  // Course exploration state
  const [selectedCourse, setSelectedCourse] = useState<RecordedCourse | null>(
    RECORDED_COURSES[0]
  );
  const [catalogueInitialCategory, setCatalogueInitialCategory] = useState<
    MusicPathway | 'all'
  >('all');
  const [catalogueInitialLevel, setCatalogueInitialLevel] = useState<string>('all');

  // Modals state
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [structuredModalOpen, setStructuredModalOpen] = useState(false);

  // Student Authentication & Enrollment State (Prompts 13 - 20)
  const [studentAccount, setStudentAccount] = useState<StudentAccount | null>(null);
  const [currentClassNumber, setCurrentClassNumber] = useState<number>(1);
  const [pendingAccountData, setPendingAccountData] = useState<
    Partial<StudentAccount> & { priorExperience?: string }
  >({
    fullName: '',
    email: '',
    phone: '',
    dob: '2000-01-01',
    deliveryAddress: '',
  });

  // Sync theme background with document body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#040C24';
      document.body.style.color = '#F7F2EB';
    } else {
      document.body.style.backgroundColor = '#F7F2EB';
      document.body.style.color = '#081F5C';
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id);
    try {
      sessionStorage.setItem('pianotastic_visitor_goal', id);
    } catch {
      // safe fallback
    }
  };

  const handleSelectCategory = (categoryId: CategoryId) => {
    setSelectedCategoryId(categoryId);
    setScreen('category-list');
  };

  const handleSelectVideo = (video: VideoLesson) => {
    setSelectedVideo(video);
    setScreen('video-player');
  };

  const handleUpdatePlaybackTime = (lessonId: string, time: number) => {
    setSessionPlaybackTimes((prev) => ({
      ...prev,
      [lessonId]: time,
    }));
  };

  const handleOpenCourseById = (courseId: string) => {
    const course = RECORDED_COURSES.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setScreen('course-details');
    }
  };

  const handleExploreRecorded = (
    category: MusicPathway | 'all' = 'all',
    level: string = 'all'
  ) => {
    setCatalogueInitialCategory(category);
    setCatalogueInitialLevel(level);
    setScreen('recorded-catalogue');
  };

  // Screen Title for TopBar
  const getScreenTitle = () => {
    switch (screen) {
      case 'goals':
        return lang === 'en' ? 'Your Musical Goals' : 'Apne Goals Chunein';
      case 'founder':
        return lang === 'en' ? 'Welcome' : 'Swagat';
      case 'free-learning-home':
        return lang === 'en' ? 'Free Learning' : 'Free Learning';
      case 'category-list': {
        const cat = FREE_CATEGORIES.find((c) => c.id === selectedCategoryId);
        return cat
          ? lang === 'en'
            ? cat.nameEn
            : cat.nameHi
          : 'Video Lessons';
      }
      case 'video-player':
        return selectedVideo
          ? lang === 'en'
            ? selectedVideo.titleEn
            : selectedVideo.titleHi
          : 'Lesson Player';
      case 'courses-home':
        return lang === 'en' ? 'Academy Courses' : 'Academy Courses';
      case 'recorded-catalogue':
        return lang === 'en' ? 'Recorded Catalogue' : 'Recorded Courses';
      case 'course-details':
        return selectedCourse
          ? lang === 'en'
            ? selectedCourse.titleEn
            : selectedCourse.titleHi
          : 'Course Overview';
      case 'enrollment-initiation':
        return lang === 'en' ? 'Enrollment' : 'Enrollment';
      case 'account-creation':
        return lang === 'en' ? 'Create Account' : 'Account Banayein';
      case 'enrollment-summary':
        return lang === 'en' ? 'Enrollment Summary' : 'Enrollment Summary';
      case 'payment':
        return lang === 'en' ? 'Payment' : 'Payment';
      case 'enrollment-confirmation':
        return lang === 'en' ? 'Confirmation' : 'Confirmation';
      case 'student-login':
        return lang === 'en' ? 'Student Sign In' : 'Sign In';
      case 'forgot-password':
        return lang === 'en' ? 'Recover Account' : 'Account Recovery';
      case 'create-password':
        return lang === 'en' ? 'Create Password' : 'Password Banayein';
      case 'student-home':
        return lang === 'en' ? 'Student Portal' : 'Student Portal';
      case 'song-library':
        return lang === 'en' ? 'Song Library' : 'Song Library';
      default:
        return undefined;
    }
  };

  // Back action handler based on current route
  const handleBack = () => {
    switch (screen) {
      case 'goals':
        setScreen('public-home');
        break;
      case 'founder':
        setScreen('goals');
        break;
      case 'free-learning-home':
        setScreen('founder');
        break;
      case 'category-list':
        setScreen('free-learning-home');
        break;
      case 'video-player':
        setScreen('category-list');
        break;
      case 'courses-home':
        setScreen('public-home');
        break;
      case 'recorded-catalogue':
        setScreen('courses-home');
        break;
      case 'course-details':
        setScreen('recorded-catalogue');
        break;
      case 'enrollment-initiation':
        setScreen('course-details');
        break;
      case 'account-creation':
        setScreen('enrollment-initiation');
        break;
      case 'enrollment-summary':
        setScreen('account-creation');
        break;
      case 'payment':
        setScreen('enrollment-summary');
        break;
      case 'enrollment-confirmation':
        setScreen('student-login');
        break;
      case 'student-login':
        setScreen('public-home');
        break;
      case 'forgot-password':
        setScreen('student-login');
        break;
      case 'create-password':
        setScreen('student-login');
        break;
      case 'student-home':
        setScreen('public-home');
        break;
      case 'song-library':
        setScreen('student-home');
        break;
      default:
        setScreen('public-home');
        break;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-body transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      {/* Splash Screen Overlay with smooth fade out */}
      <AnimatePresence>
        {screen === 'splash' && (
          <SplashScreen onFinish={() => setScreen('goals')} />
        )}
      </AnimatePresence>

      {/* Persistent App Header (Shown on public browsing screens) */}
      {screen !== 'splash' &&
        screen !== 'student-home' &&
        screen !== 'account-creation' &&
        screen !== 'enrollment-summary' &&
        screen !== 'payment' &&
        screen !== 'enrollment-confirmation' &&
        screen !== 'student-login' &&
        screen !== 'forgot-password' &&
        screen !== 'create-password' && (
          <TopBar
            currentScreen={screen}
            onNavigateScreen={(s) => setScreen(s)}
            onOpenBooks={() => setBooksModalOpen(true)}
            onOpenContact={() => setContactModalOpen(true)}
            showBack={screen !== 'public-home' && screen !== 'welcome' && screen !== 'goals'}
            onBack={handleBack}
            lang={lang}
            onToggleLang={toggleLanguage}
            theme={theme}
            onToggleTheme={toggleTheme}
            title={getScreenTitle()}
            showLogo={screen === 'public-home' || screen === 'welcome' || screen === 'goals'}
            onLogoClick={() => setScreen('public-home')}
          />
        )}

      {/* Screen Views */}
      <main className="flex-1 w-full">
        {/* PROMPTS 7 & 8: Main Public Home / Explore Screen */}
        {screen === 'public-home' && (
          <PublicHomeScreen
            onNavigateScreen={(s) => setScreen(s)}
            onOpenCourse={handleOpenCourseById}
            onOpenBooks={() => setBooksModalOpen(true)}
            onOpenContact={() => setContactModalOpen(true)}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 9: Courses Home Screen */}
        {screen === 'courses-home' && (
          <CoursesHomeScreen
            onExploreRecorded={handleExploreRecorded}
            onExploreStructured={() => setStructuredModalOpen(true)}
            onOpenCourse={handleOpenCourseById}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 10: Recorded Course Catalogue */}
        {screen === 'recorded-catalogue' && (
          <RecordedCatalogueScreen
            initialCategory={catalogueInitialCategory}
            initialLevel={catalogueInitialLevel}
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setScreen('course-details');
            }}
            onBack={() => setScreen('courses-home')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 11: Course Details Screen */}
        {screen === 'course-details' && selectedCourse && (
          <CourseDetailsScreen
            course={selectedCourse}
            onEnroll={(course) => {
              setSelectedCourse(course);
              setScreen('enrollment-initiation');
            }}
            onBack={() => setScreen('recorded-catalogue')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 12: Enrollment Initiation Flow */}
        {screen === 'enrollment-initiation' && selectedCourse && (
          <EnrollmentInitiationScreen
            course={selectedCourse}
            onBack={() => setScreen('course-details')}
            onComplete={() => setScreen('account-creation')}
            onContinueToAccount={(data) => {
              setPendingAccountData((prev) => ({
                ...prev,
                ...data,
              }));
              setScreen('account-creation');
            }}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 13: Account Creation Screen */}
        {screen === 'account-creation' && selectedCourse && (
          <AccountCreationScreen
            course={selectedCourse}
            initialData={pendingAccountData}
            onBack={() => setScreen('enrollment-initiation')}
            onContinue={(account) => {
              setPendingAccountData((prev) => ({
                ...prev,
                ...account,
              }));
              setScreen('enrollment-summary');
            }}
            onGoToLogin={() => setScreen('student-login')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 14: Enrollment Summary Screen */}
        {screen === 'enrollment-summary' && selectedCourse && (
          <EnrollmentSummaryScreen
            course={selectedCourse}
            account={pendingAccountData}
            onBack={() => setScreen('account-creation')}
            onProceedToPayment={() => setScreen('payment')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 15: Payment Screen */}
        {screen === 'payment' && selectedCourse && (
          <PaymentScreen
            course={selectedCourse}
            account={pendingAccountData}
            onBack={() => setScreen('enrollment-summary')}
            onPaymentSuccess={(tx) => {
              const studentNumber = Math.floor(1000 + Math.random() * 9000);
              const generatedStudentId = `PA-2026-${studentNumber}`;
              const confirmedAccount: StudentAccount = {
                studentId: generatedStudentId,
                fullName: pendingAccountData.fullName || 'Rahul Sharma',
                email: pendingAccountData.email || 'student@pianotastic.com',
                phone: pendingAccountData.phone || '+91 98765 43210',
                dob: pendingAccountData.dob,
                hasCustomPassword: false,
                enrolledCourseId: selectedCourse.id,
                enrolledAt: new Date().toISOString(),
                paymentReference: tx.transactionId,
                amountPaid: tx.amountPaid,
                deliveryAddress: pendingAccountData.deliveryAddress,
              };
              setStudentAccount(confirmedAccount);
              setScreen('enrollment-confirmation');
            }}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 16: Enrollment Confirmation Screen */}
        {screen === 'enrollment-confirmation' && selectedCourse && studentAccount && (
          <EnrollmentConfirmationScreen
            course={selectedCourse}
            student={studentAccount}
            onContinueToSignIn={() => setScreen('student-login')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 17: Student Login Screen */}
        {screen === 'student-login' && (
          <StudentLoginScreen
            currentStudent={studentAccount}
            onLoginSuccess={(stu, isFirst) => {
              setStudentAccount(stu);
              if (isFirst) {
                setScreen('create-password');
              } else {
                setScreen('student-home');
              }
            }}
            onForgotPassword={() => setScreen('forgot-password')}
            onBackToPublic={() => setScreen('public-home')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 18: Forgot Password / Recovery Screen */}
        {screen === 'forgot-password' && (
          <ForgotPasswordScreen
            currentStudent={studentAccount}
            onBackToLogin={() => setScreen('student-login')}
            onCodeVerified={(verifiedStu) => {
              setStudentAccount(verifiedStu);
              setScreen('create-password');
            }}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 19: Create Password Screen */}
        {screen === 'create-password' && (
          <CreatePasswordScreen
            student={
              studentAccount || {
                studentId: 'PA-2026-0482',
                fullName: 'Rahul Sharma',
                email: 'student@pianotastic.com',
                phone: '+91 98765 43210',
                hasCustomPassword: false,
              }
            }
            onPasswordCreated={(updatedStu) => {
              setStudentAccount(updatedStu);
              setScreen('student-home');
            }}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 20 & 21: Authenticated Student Home & Dedicated Learn Home */}
        {screen === 'student-home' && (
          <StudentHomeScreen
            student={
              studentAccount || {
                studentId: 'PA-2026-0482',
                fullName: 'Rahul Sharma',
                email: 'student@pianotastic.com',
                phone: '+91 98765 43210',
                hasCustomPassword: true,
                enrolledCourseId: selectedCourse?.id || 'western-beginner',
              }
            }
            course={selectedCourse || RECORDED_COURSES[0]}
            onSignOut={() => setScreen('public-home')}
            onRequireLogin={() => setScreen('student-login')}
            onSelectCourse={(c) => setSelectedCourse(c)}
            onOpenClass={(cNum) => {
              setCurrentClassNumber(cNum);
              setScreen('individual-recorded-class');
            }}
            onOpenSongLibrary={() => setScreen('song-library')}
            onToggleTheme={toggleTheme}
            onToggleLang={toggleLanguage}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT: Song Library Repertoire Hub */}
        {screen === 'song-library' && (
          <SongLibraryScreen
            student={
              studentAccount || {
                studentId: 'PA-2026-0482',
                fullName: 'Rahul Sharma',
                email: 'student@pianotastic.com',
                phone: '+91 98765 43210',
                hasCustomPassword: true,
                enrolledCourseId: selectedCourse?.id || 'western-beginner',
              }
            }
            course={selectedCourse || RECORDED_COURSES[0]}
            onBack={() => setScreen('student-home')}
            lang={lang}
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleLang={toggleLanguage}
          />
        )}

        {/* PROMPT: Individual Recorded Class Screen & 5 Learning Support Sections */}
        {screen === 'individual-recorded-class' && (
          <IndividualRecordedClassScreen
            course={selectedCourse || RECORDED_COURSES[0]}
            classNumber={currentClassNumber}
            student={
              studentAccount || {
                studentId: 'PA-2026-0482',
                fullName: 'Rahul Sharma',
                email: 'student@pianotastic.com',
                phone: '+91 98765 43210',
                hasCustomPassword: true,
                enrolledCourseId: selectedCourse?.id || 'western-beginner',
              }
            }
            onBack={() => setScreen('student-home')}
            onOpenClass={(targetNum) => setCurrentClassNumber(targetNum)}
            lang={lang}
            onToggleLang={toggleLanguage}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* PROMPT 1: Welcome & Onboarding Screen */}
        {screen === 'welcome' && (
          <WelcomeScreen
            onExplore={() => setScreen('goals')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 2: Goal Selection Screen */}
        {screen === 'goals' && (
          <GoalSelectionScreen
            selectedGoalId={selectedGoalId}
            onSelectGoal={handleSelectGoal}
            onContinue={() => setScreen('founder')}
            onBack={() => setScreen('public-home')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 3: Founder Welcome Screen */}
        {screen === 'founder' && (
          <FounderWelcomeScreen
            onContinue={() => setScreen('free-learning-home')}
            onBack={() => setScreen('goals')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 4: Free Learning Home Screen */}
        {screen === 'free-learning-home' && (
          <FreeLearningHomeScreen
            onSelectCategory={handleSelectCategory}
            onExploreCourses={() => setScreen('courses-home')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 5: Category Video List Screen */}
        {screen === 'category-list' && (
          <CategoryVideoListScreen
            categoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onSelectVideo={handleSelectVideo}
            onBack={() => setScreen('free-learning-home')}
            lang={lang}
            theme={theme}
          />
        )}

        {/* PROMPT 6: Video Player Screen */}
        {screen === 'video-player' && selectedVideo && (
          <VideoPlayerScreen
            lesson={selectedVideo}
            onBack={() => setScreen('category-list')}
            onSelectRelatedLesson={(lesson) => setSelectedVideo(lesson)}
            lang={lang}
            theme={theme}
            sessionPlaybackTimes={sessionPlaybackTimes}
            onUpdatePlaybackTime={handleUpdatePlaybackTime}
          />
        )}
      </main>

      {/* Global Modals */}
      <BooksModal
        isOpen={booksModalOpen}
        onClose={() => setBooksModalOpen(false)}
        lang={lang}
        theme={theme}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        lang={lang}
        theme={theme}
      />

      <StructuredCoursesModal
        isOpen={structuredModalOpen}
        onClose={() => setStructuredModalOpen(false)}
        onExploreRecorded={() => {
          setStructuredModalOpen(false);
          handleExploreRecorded();
        }}
        lang={lang}
        theme={theme}
      />
    </div>
  );
}

