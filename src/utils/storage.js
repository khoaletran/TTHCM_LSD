// Quản lý LocalStorage 100% client-side, bảo mật, không gửi dữ liệu ra ngoài

const STORAGE_KEYS = {
  THEME: 'study_theme',
  WRONG_BANK: 'study_wrong_bank',
  HISTORY: 'study_quiz_history',
  BOOKMARKS: 'study_bookmarks',
  LAST_SUBJECT: 'study_last_subject',
};

// --- Theme ---
export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

// --- Wrong Question Bank (Ôn câu hay sai) ---
export function getWrongBank(subjectId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WRONG_BANK}_${subjectId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordQuestionResult(subjectId, questionId, isCorrect) {
  try {
    const bank = getWrongBank(subjectId);
    const key = String(questionId);
    if (isCorrect) {
      // Nếu trả lời đúng thì gỡ khỏi danh sách câu sai
      delete bank[key];
    } else {
      // Nếu sai thì tăng số lần sai
      bank[key] = {
        id: questionId,
        wrongCount: (bank[key]?.wrongCount || 0) + 1,
        lastFailedAt: Date.now(),
      };
    }
    localStorage.setItem(`${STORAGE_KEYS.WRONG_BANK}_${subjectId}`, JSON.stringify(bank));
  } catch {}
}

export function clearWrongBank(subjectId) {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.WRONG_BANK}_${subjectId}`);
  } catch {}
}

// --- Bookmarks (Đánh dấu câu hỏi) ---
export function getBookmarks(subjectId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.BOOKMARKS}_${subjectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(subjectId, questionId) {
  try {
    const list = getBookmarks(subjectId);
    const numId = Number(questionId);
    const idx = list.indexOf(numId);
    let updated;
    if (idx >= 0) {
      updated = list.filter((id) => id !== numId);
    } else {
      updated = [...list, numId];
    }
    localStorage.setItem(`${STORAGE_KEYS.BOOKMARKS}_${subjectId}`, JSON.stringify(updated));
    return updated.includes(numId);
  } catch {
    return false;
  }
}

export function isBookmarked(subjectId, questionId) {
  const list = getBookmarks(subjectId);
  return list.includes(Number(questionId));
}

// --- Quiz History (Lịch sử làm bài) ---
export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizHistory(entry) {
  try {
    const history = getQuizHistory();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };
    // Lưu tối đa 50 bài gần nhất
    const updated = [newEntry, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return newEntry;
  } catch {
    return null;
  }
}

// --- Last selected subject ---
export function getLastSubject() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SUBJECT) || 'tthcm';
  } catch {
    return 'tthcm';
  }
}

export function setLastSubject(subjectId) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SUBJECT, subjectId);
  } catch {}
}
