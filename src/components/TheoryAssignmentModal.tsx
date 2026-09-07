import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { TheoryAssignment, Language, Theme } from '../types';
import {
  TheoryAssignmentProgress,
  getTheoryAssignmentProgress,
  saveTheoryAssignmentProgress,
} from '../utils/studentLearningService';

interface TheoryAssignmentModalProps {
  assignment: TheoryAssignment;
  courseId: string;
  studentId: string;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

export const TheoryAssignmentModal: React.FC<TheoryAssignmentModalProps> = ({
  assignment,
  courseId,
  studentId,
  onClose,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const totalQuestions = assignment.questions.length;

  // Load persistent progress or initialize
  const savedState = getTheoryAssignmentProgress(studentId, courseId, assignment.classNumber);

  const [currentIndex, setCurrentIndex] = useState<number>(
    savedState && savedState.currentQuestionIndex < totalQuestions
      ? savedState.currentQuestionIndex
      : 0
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>(
    savedState ? savedState.answers : {}
  );
  const [answerEvaluations, setAnswerEvaluations] = useState<Record<string, boolean>>(
    savedState ? savedState.scores : {}
  );
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(
    savedState?.status === 'completed'
  );
  const [isReviewMode, setIsReviewMode] = useState<boolean>(
    savedState?.status === 'completed'
  );

  const currentQ = assignment.questions[currentIndex] || assignment.questions[0];

  // Sync state whenever question changes
  useEffect(() => {
    setShowValidation(false);
    setIsCurrentCorrect(null);
    const existing = selectedAnswers[currentQ?.id];
    if (typeof existing === 'string') {
      setTypedAnswer(existing);
    } else {
      setTypedAnswer('');
    }
  }, [currentIndex, currentQ?.id]);

  // Persist in-progress state to local storage
  const persistState = (
    newAnswers = selectedAnswers,
    newScores = answerEvaluations,
    status: 'in_progress' | 'completed' = 'in_progress'
  ) => {
    let correctCount = 0;
    Object.values(newScores).forEach((val) => {
      if (val) correctCount++;
    });

    const scorePct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const payload: TheoryAssignmentProgress = {
      assignmentId: assignment.id,
      studentId,
      courseId,
      classNumber: assignment.classNumber,
      status,
      currentQuestionIndex: currentIndex,
      answers: newAnswers,
      scores: newScores,
      totalQuestions,
      scoreCount: correctCount,
      scorePercent: scorePct,
      submittedAt: status === 'completed' ? new Date().toISOString() : savedState?.submittedAt,
    };

    saveTheoryAssignmentProgress(payload);
  };

  // Check current answer
  const handleValidateCurrent = () => {
    if (!currentQ) return;

    let isCorrect = false;
    let answerToRecord = '';

    if (currentQ.type === 'short_answer') {
      const cleanInput = typedAnswer.trim().toLowerCase().replace(/[\s,]+/g, ' ');
      const cleanExpected = Array.isArray(currentQ.correctAnswer)
        ? currentQ.correctAnswer.map((s) => s.toLowerCase().trim().replace(/[\s,]+/g, ' '))
        : [currentQ.correctAnswer.toLowerCase().trim().replace(/[\s,]+/g, ' ')];

      isCorrect = cleanExpected.some((exp) => cleanInput === exp);
      answerToRecord = typedAnswer;
    } else {
      const chosen = selectedAnswers[currentQ.id];
      if (typeof chosen === 'string') {
        isCorrect = chosen.toLowerCase() === (currentQ.correctAnswer as string).toLowerCase();
        answerToRecord = chosen;
      }
    }

    setIsCurrentCorrect(isCorrect);
    setShowValidation(true);

    const updatedAnswers = { ...selectedAnswers, [currentQ.id]: answerToRecord };
    const updatedScores = { ...answerEvaluations, [currentQ.id]: isCorrect };
    setSelectedAnswers(updatedAnswers);
    setAnswerEvaluations(updatedScores);

    persistState(updatedAnswers, updatedScores, 'in_progress');
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Prompt final confirmation before submission
      setIsConfirmingSubmit(true);
    }
  };

  const handleFinalSubmit = () => {
    setIsConfirmingSubmit(false);
    setIsCompleted(true);
    setIsReviewMode(false);
    persistState(selectedAnswers, answerEvaluations, 'completed');
  };

  const handleRestartAssignment = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setAnswerEvaluations({});
    setShowValidation(false);
    setIsCurrentCorrect(null);
    setIsCompleted(false);
    setIsReviewMode(false);
    persistState({}, {}, 'in_progress');
  };

  // Calculate score summary
  let totalScoreCount = 0;
  Object.values(answerEvaluations).forEach((v) => {
    if (v) totalScoreCount++;
  });
  const finalPercentage = totalQuestions > 0 ? Math.round((totalScoreCount / totalQuestions) * 100) : 0;

  return (
    <div
      id="theory-assignment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs"
    >
      <div
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
            : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#081F5C]/10 dark:border-white/10 flex-shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
              {lang === 'en' ? 'Theory Assignment' : 'Theory Assignment'} • Class {assignment.classNumber}
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold">
              {lang === 'en' ? assignment.titleEn : assignment.titleHi}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-500/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* CONFIRMATION STEP BEFORE SUBMISSION */}
          {isConfirmingSubmit ? (
            <div className="p-6 rounded-2xl border text-center space-y-4 border-[#081F5C]/15 dark:border-white/15">
              <HelpCircle className="w-12 h-12 mx-auto text-[#C5A869]" />
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold">
                  {lang === 'en' ? 'Submit your answers?' : 'Apne answers submit karein?'}
                </h3>
                <p className="text-xs opacity-75 max-w-sm mx-auto">
                  {lang === 'en'
                    ? `You have answered ${Object.keys(selectedAnswers).length} of ${totalQuestions} questions. Would you like to finalize and submit?`
                    : `Aapne ${totalQuestions} me se ${Object.keys(selectedAnswers).length} questions answer kar liye hain.`}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsConfirmingSubmit(false)}
                  className="px-5 py-2.5 rounded-full border border-[#081F5C]/20 dark:border-white/20 text-xs font-semibold cursor-pointer"
                >
                  {lang === 'en' ? 'Go Back' : 'Wapas Jayein'}
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold shadow-md cursor-pointer"
                >
                  {lang === 'en' ? 'Submit Assignment' : 'Assignment Submit Kijiye'}
                </button>
              </div>
            </div>
          ) : isCompleted && !isReviewMode ? (
            /* ASSIGNMENT RESULT SCREEN (Section 13) */
            <div className="p-6 sm:p-8 rounded-2xl border text-center space-y-5 border-[#C5A869]/40 bg-[#C5A869]/5">
              <div className="w-16 h-16 rounded-full bg-[#C5A869]/20 text-[#C5A869] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  {lang === 'en' ? 'Assessment Submitted' : 'Assessment Submitted'}
                </span>
                <h3 className="font-display text-2xl font-bold">
                  {lang === 'en' ? 'Assignment Complete' : 'Assignment Complete'}
                </h3>
              </div>

              {/* Real Grade Display */}
              <div className="p-4 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 inline-block mx-auto min-w-[200px]">
                <div className="text-3xl font-mono font-bold text-[#C5A869]">
                  {totalScoreCount} / {totalQuestions}
                </div>
                <div className="text-xs opacity-75 font-semibold mt-0.5">
                  {finalPercentage}% {lang === 'en' ? 'Correct' : 'Sahi'}
                </div>
              </div>

              <p className="text-xs opacity-80 max-w-sm mx-auto leading-relaxed">
                {finalPercentage >= assignment.passingScorePercent
                  ? lang === 'en'
                    ? 'Excellent theoretical comprehension! You have demonstrated solid command over the musical concepts taught in this class.'
                    : 'Bahut badhiya! Is class ke saare main concepts aapne achhi tarah samajh liye hain.'
                  : lang === 'en'
                  ? 'Good effort. Review the questions and explanations below to solidify your music theory understanding.'
                  : 'Achha prayas. Niche diye gaye questions aur explanations dekhkar concepts clear karein.'}
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsReviewMode(true)}
                  className="px-6 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'Review Answers' : 'Answers Review Karein'}
                </button>
                <button
                  onClick={handleRestartAssignment}
                  className="px-5 py-2.5 rounded-full border border-[#081F5C]/20 dark:border-white/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Retake Assignment' : 'Phir Se Try Kijiye'}</span>
                </button>
              </div>
            </div>
          ) : isReviewMode ? (
            /* REVIEW ANSWERS MODE (Section 14) */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#081F5C]/10 dark:border-white/10">
                <h3 className="font-display font-bold text-sm sm:text-base">
                  {lang === 'en' ? 'Assignment Review' : 'Assignment Review'}
                </h3>
                <span className="text-xs font-mono font-bold text-[#C5A869]">
                  {totalScoreCount} / {totalQuestions} Correct ({finalPercentage}%)
                </span>
              </div>

              <div className="space-y-4">
                {assignment.questions.map((q, idx) => {
                  const studentAns = selectedAnswers[q.id];
                  const isQCorrect = answerEvaluations[q.id];

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border space-y-2 text-xs transition-colors ${
                        isQCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 font-semibold">
                        <span>
                          {idx + 1}. {lang === 'en' ? q.promptEn : q.promptHi}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                            isQCorrect
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isQCorrect ? '✓ Correct' : '✕ Incorrect'}
                        </span>
                      </div>

                      <div className="space-y-1 opacity-80 pt-1">
                        <div>
                          <strong>{lang === 'en' ? 'Your Answer:' : 'Aapka Answer:'}</strong>{' '}
                          <span className="font-mono">{studentAns ? String(studentAns) : 'Not answered'}</span>
                        </div>
                        {q.explanationEn && (
                          <div className="text-[11px] italic opacity-90 pt-0.5">
                            <strong>Note:</strong> {lang === 'en' ? q.explanationEn : q.explanationHi}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setIsReviewMode(false)}
                  className="px-6 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'Done' : 'Theek Hai'}
                </button>
              </div>
            </div>
          ) : (
            /* QUESTION-BY-QUESTION ACTIVE RUNNER (Section 4 & 5) */
            <div className="space-y-5">
              {/* Question Progress Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#C5A869] uppercase tracking-wider text-[11px]">
                  {lang === 'en'
                    ? `Question ${currentIndex + 1} of ${totalQuestions}`
                    : `Sawaal ${currentIndex + 1} me se ${totalQuestions}`}
                </span>
                <span className="opacity-65 text-[11px]">
                  {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-[#081F5C]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A869] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Question Prompt */}
              <div className="p-4 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-3">
                <h3 className="font-bold text-sm sm:text-base leading-snug">
                  {lang === 'en' ? currentQ.promptEn : currentQ.promptHi}
                </h3>

                {/* Optional Notation SVG or Diagram */}
                {currentQ.notationSvg && (
                  <div className="p-3 bg-white dark:bg-black/50 rounded-xl flex justify-center border border-current/10">
                    <div dangerouslySetInnerHTML={{ __html: currentQ.notationSvg }} />
                  </div>
                )}
              </div>

              {/* Answer Options Container */}
              {currentQ.type === 'short_answer' ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold opacity-80">
                    {lang === 'en' ? 'Type your answer:' : 'Apna answer yahan type kijiye:'}
                  </label>
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. 1' : 'jaise 1'}
                    className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#081F5C]/30 border-[#0E2E80] text-white focus:border-[#C5A869]'
                        : 'bg-white border-[#081F5C]/20 text-[#081F5C] focus:border-[#081F5C]'
                    }`}
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [currentQ.id]: opt.id,
                          }));
                          setShowValidation(false);
                          setIsCurrentCorrect(null);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] border-transparent shadow-sm'
                            : isDark
                            ? 'bg-[#081F5C]/25 border-[#0E2E80] hover:border-[#C5A869]/50'
                            : 'bg-white border-[#081F5C]/15 hover:border-[#C5A869]'
                        }`}
                      >
                        <span>{lang === 'en' ? opt.textEn : opt.textHi}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-current bg-current' : 'border-current/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Validation Result Strip (Section 5) */}
              {showValidation && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
                    isCurrentCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCurrentCorrect ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="font-bold">
                      {isCurrentCorrect
                        ? lang === 'en'
                          ? 'Correct ✓'
                          : 'Correct ✓'
                        : lang === 'en'
                        ? 'Not quite.'
                        : 'Not quite.'}
                    </span>
                  </div>

                  {!isCurrentCorrect && (
                    <button
                      onClick={() => setShowValidation(false)}
                      className="text-[11px] font-bold underline cursor-pointer"
                    >
                      {lang === 'en' ? 'Try Again' : 'Phir Se Try Kijiye'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer for Question Navigation */}
        {!isCompleted && !isConfirmingSubmit && (
          <div className="px-6 py-3.5 border-t border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-transparent">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs font-semibold disabled:opacity-25 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Previous' : 'Pichla'}</span>
            </button>

            <div className="flex items-center gap-2">
              {!showValidation ? (
                <button
                  onClick={handleValidateCurrent}
                  disabled={
                    currentQ?.type === 'short_answer'
                      ? !typedAnswer.trim()
                      : !selectedAnswers[currentQ?.id]
                  }
                  className="px-5 py-2 rounded-full border border-[#C5A869] text-[#C5A869] text-xs font-bold disabled:opacity-30 hover:bg-[#C5A869]/10 cursor-pointer"
                >
                  {lang === 'en' ? 'Check Answer' : 'Check Karein'}
                </button>
              ) : null}

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>
                  {currentIndex === totalQuestions - 1
                    ? lang === 'en'
                      ? 'Review & Submit'
                      : 'Submit Kijiye'
                    : lang === 'en'
                    ? 'Next Question'
                    : 'Agla Sawaal'}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
