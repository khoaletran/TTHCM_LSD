// Unified Question Repository
import { questionsLSD } from './questions_lsd';
import { questionsTTHCM } from './questions_tthcm';
import { SUBJECTS, getChapter, getChapterSections } from './subjects';
import { FLASHCARDS_LSD, FLASHCARDS_TTHCM } from './flashcards';

const BANK = {
  lsd: questionsLSD,
  tthcm: questionsTTHCM,
};

const FLASHCARDS = {
  lsd: FLASHCARDS_LSD,
  tthcm: FLASHCARDS_TTHCM,
};

// Lấy tất cả câu hỏi của môn
export function getAllQuestions(subjectId) {
  return BANK[subjectId] || [];
}

// Lấy câu hỏi theo ID
export function getQuestionById(subjectId, id) {
  const list = getAllQuestions(subjectId);
  const numId = Number(id);
  return list.find((q) => q.id === numId) || null;
}

// Lấy câu hỏi theo Chương (kèm tất cả các section của chương đó)
export function getQuestionsByChapter(subjectId, chapterId) {
  const sections = getChapterSections(subjectId, chapterId);
  if (!sections.length) return [];
  const list = getAllQuestions(subjectId);
  return list.filter((q) => sections.includes(q.section));
}

// Lấy câu hỏi theo Section cụ thể
export function getQuestionsBySection(subjectId, sectionId) {
  const list = getAllQuestions(subjectId);
  return list.filter((q) => q.section === sectionId);
}

// Lấy flashcards theo chương
export function getFlashcardsByChapter(subjectId, chapterId) {
  const cards = FLASHCARDS[subjectId];
  if (!cards) return [];
  return cards[chapterId] || [];
}

// Thống kê của một môn
export function getSubjectStats(subjectId) {
  const list = getAllQuestions(subjectId);
  const sub = SUBJECTS[subjectId];
  if (!sub) return null;

  const chapterStats = sub.chapters.map((ch) => {
    const qCount = list.filter((q) => ch.sections.includes(q.section)).length;
    const fCount = (FLASHCARDS[subjectId]?.[ch.id] || []).length;
    return {
      ...ch,
      questionCount: qCount,
      flashcardCount: fCount,
    };
  });

  return {
    id: sub.id,
    name: sub.name,
    shortName: sub.shortName,
    description: sub.description,
    color: sub.color,
    totalQuestions: list.length,
    totalChapters: sub.chapters.length,
    chapters: chapterStats,
  };
}

// Thống kê tổng quan cả hệ thống
export function getGlobalStats() {
  const lsdCount = questionsLSD.length;
  const tthcmCount = questionsTTHCM.length;
  return {
    totalQuestions: lsdCount + tthcmCount,
    totalSubjects: 2,
    totalChapters: SUBJECTS.lsd.chapters.length + SUBJECTS.tthcm.chapters.length,
    lsd: {
      count: lsdCount,
      chapters: SUBJECTS.lsd.chapters.length,
    },
    tthcm: {
      count: tthcmCount,
      chapters: SUBJECTS.tthcm.chapters.length,
    },
  };
}

// Tìm kiếm câu hỏi với bộ lọc
export function filterQuestions(subjectId, { query = '', chapterId = '', section = '' } = {}) {
  let list = getAllQuestions(subjectId);

  if (chapterId) {
    const sections = getChapterSections(subjectId, chapterId);
    list = list.filter((q) => sections.includes(q.section));
  } else if (section) {
    list = list.filter((q) => q.section === section);
  }

  if (query && query.trim()) {
    const qLower = query.toLowerCase().trim();
    list = list.filter((q) => {
      const matchQ = q.q.toLowerCase().includes(qLower);
      const matchOpts = q.options.some((opt) => opt.toLowerCase().includes(qLower));
      const matchExp = q.explain ? q.explain.toLowerCase().includes(qLower) : false;
      const matchId = String(q.id).includes(qLower);
      return matchQ || matchOpts || matchExp || matchId;
    });
  }

  return list;
}

// Helper: Shuffle array ngẫu nhiên
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Lấy bộ câu hỏi luyện tập ngẫu nhiên
export function getPracticeSet(subjectId, { chapterId = '', count = 20, random = true } = {}) {
  let list = chapterId
    ? getQuestionsByChapter(subjectId, chapterId)
    : getAllQuestions(subjectId);

  if (random) {
    list = shuffleArray(list);
  }

  if (count && count > 0 && count < list.length) {
    list = list.slice(0, count);
  }

  return list;
}
