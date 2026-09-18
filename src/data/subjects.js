// Cấu hình các môn học và chương/phần

export const SUBJECTS = {
  lsd: {
    id: 'lsd',
    name: 'Lịch sử Đảng Cộng sản Việt Nam',
    shortName: 'Lịch sử Đảng',
    description: 'Ôn tập môn Lịch sử Đảng Cộng sản Việt Nam',
    color: '#8f2233',
    chapters: [
      {
        id: 'mo-dau',
        name: 'Phần Mở đầu',
        shortName: 'Mở đầu',
        sections: ['mo-dau'],
        description: 'Đối tượng, chức năng, nhiệm vụ, nội dung và phương pháp nghiên cứu môn học Lịch sử Đảng',
      },
      {
        id: 'ch1',
        name: 'Chương 1: Đảng Cộng sản Việt Nam ra đời và lãnh đạo đấu tranh giành chính quyền (1920 – 1945)',
        shortName: 'Chương 1',
        sections: ['ch1-1', 'ch1-2'],
        description: 'Sự ra đời và lãnh đạo cách mạng giai đoạn 1920–1945',
      },
      {
        id: 'ch2',
        name: 'Chương 2: Đảng lãnh đạo hai cuộc kháng chiến, hoàn thành giải phóng dân tộc, thống nhất đất nước (1945 – 1975)',
        shortName: 'Chương 2',
        sections: ['ch2-1', 'ch2-2'],
        description: 'Lãnh đạo kháng chiến và thống nhất đất nước giai đoạn 1945–1975',
      },
      {
        id: 'ch3',
        name: 'Chương 3: Đảng lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975 – 2018)',
        shortName: 'Chương 3',
        sections: ['ch3-1', 'ch3-2'],
        description: 'Đổi mới và xây dựng chủ nghĩa xã hội giai đoạn 1975–2018',
      },
    ],
  },
  tthcm: {
    id: 'tthcm',
    name: 'Tư tưởng Hồ Chí Minh',
    shortName: 'Tư tưởng HCM',
    description: 'Ôn tập môn Tư tưởng Hồ Chí Minh',
    color: '#8f2233',
    chapters: [
      {
        id: 'tthcm-ch1',
        name: 'Chương 1: Khái niệm, nguồn gốc, quá trình hình thành và phát triển tư tưởng Hồ Chí Minh',
        shortName: 'Chương 1',
        sections: ['tthcm-ch1'],
        description: 'Nguồn gốc và quá trình hình thành tư tưởng Hồ Chí Minh',
      },
      {
        id: 'tthcm-ch2',
        name: 'Chương 2: Tư tưởng Hồ Chí Minh về vấn đề dân tộc và cách mạng giải phóng dân tộc',
        shortName: 'Chương 2',
        sections: ['tthcm-ch2'],
        description: 'Vấn đề dân tộc và cách mạng giải phóng dân tộc',
      },
      {
        id: 'tthcm-ch3',
        name: 'Chương 3: Tư tưởng Hồ Chí Minh về chủ nghĩa xã hội và con đường quá độ lên chủ nghĩa xã hội ở Việt Nam',
        shortName: 'Chương 3',
        sections: ['tthcm-ch3'],
        description: 'Chủ nghĩa xã hội và con đường quá độ ở Việt Nam',
      },
      {
        id: 'tthcm-ch4',
        name: 'Chương 4: Tư tưởng Hồ Chí Minh về Đảng Cộng sản Việt Nam',
        shortName: 'Chương 4',
        sections: ['tthcm-ch4'],
        description: 'Tư tưởng về Đảng Cộng sản Việt Nam',
      },
      {
        id: 'tthcm-ch5',
        name: 'Chương 5: Tư tưởng Hồ Chí Minh về đại đoàn kết dân tộc và đoàn kết quốc tế',
        shortName: 'Chương 5',
        sections: ['tthcm-ch5'],
        description: 'Đại đoàn kết dân tộc và đoàn kết quốc tế',
      },
      {
        id: 'tthcm-ch6',
        name: 'Chương 6: Tư tưởng Hồ Chí Minh về văn hóa, đạo đức và xây dựng con người mới',
        shortName: 'Chương 6',
        sections: ['tthcm-ch6'],
        description: 'Văn hóa, đạo đức và xây dựng con người mới',
      },
    ],
  },
};

// Lấy metadata chương theo subjectId + chapterId
export function getChapter(subjectId, chapterId) {
  return SUBJECTS[subjectId]?.chapters.find((c) => c.id === chapterId) || null;
}

// Lấy tất cả sections của một chapter
export function getChapterSections(subjectId, chapterId) {
  return getChapter(subjectId, chapterId)?.sections || [];
}
