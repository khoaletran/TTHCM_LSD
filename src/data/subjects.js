// Cấu hình các môn học và chương/phần

export const SECTIONS_CONFIG = {
  'mo-dau': {
    id: 'mo-dau',
    code: 'Mở đầu',
    title: 'Phần Mở đầu: Đối tượng, chức năng, nhiệm vụ và phương pháp nghiên cứu Lịch sử Đảng',
    shortTitle: 'Đối tượng, chức năng, nhiệm vụ và phương pháp nghiên cứu',
    description: 'Đối tượng nghiên cứu, chức năng, nhiệm vụ và các phương pháp nghiên cứu khoa học Lịch sử Đảng',
  },
  'ch1-1': {
    id: 'ch1-1',
    code: 'Mục 1.1',
    title: 'Mục 1.1: Đảng Cộng sản Việt Nam ra đời và Cương lĩnh chính trị đầu tiên của Đảng (tháng 2/1930)',
    shortTitle: 'Đảng ra đời & Cương lĩnh đầu tiên (1920–1930)',
    description: 'Bối cảnh lịch sử, phong trào yêu nước, Nguyễn Ái Quốc và Hội nghị thành lập Đảng 3/2/1930',
  },
  'ch1-2': {
    id: 'ch1-2',
    code: 'Mục 1.2',
    title: 'Mục 1.2: Lãnh đạo quá trình đấu tranh giành chính quyền (1930 – 1945)',
    shortTitle: 'Đấu tranh giành chính quyền (1930–1945)',
    description: 'Cao trào 1930-1931, Xô viết Nghệ Tĩnh, cao trào 1936-1939, giải phóng dân tộc 1939-1945 và Tổng khởi nghĩa CMT8',
  },
  'ch2-1': {
    id: 'ch2-1',
    code: 'Mục 2.1',
    title: 'Mục 2.1: Lãnh đạo xây dựng, bảo vệ chính quyền cách mạng và kháng chiến chống thực dân Pháp (1945 – 1954)',
    shortTitle: 'Bảo vệ chính quyền & Kháng chiến chống Pháp (1945–1954)',
    description: 'Bảo vệ chính quyền non trẻ 1945-1946, đường lối toàn quốc kháng chiến và chiến thắng Điện Biên Phủ 1954',
  },
  'ch2-2': {
    id: 'ch2-2',
    code: 'Mục 2.2',
    title: 'Mục 2.2: Lãnh đạo xây dựng chủ nghĩa xã hội ở miền Bắc và kháng chiến chống Mỹ, cứu nước (1954 – 1975)',
    shortTitle: 'Xây dựng CNXH miền Bắc & Kháng chiến chống Mỹ (1954–1975)',
    description: 'Đường lối cách mạng hai miền, đánh bại các chiến lược chiến tranh của Mỹ và Đại thắng mùa Xuân 1975',
  },
  'ch3-1': {
    id: 'ch3-1',
    code: 'Mục 3.1',
    title: 'Mục 3.1: Lãnh đạo cả nước xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc (1975 – 1986)',
    shortTitle: 'Xây dựng CNXH & Bảo vệ Tổ quốc (1975–1986)',
    description: 'Thống nhất đất nước về mặt nhà nước, bảo vệ biên giới và các bước đột phá tìm tòi đổi mới',
  },
  'ch3-2': {
    id: 'ch3-2',
    code: 'Mục 3.2',
    title: 'Mục 3.2: Lãnh đạo công cuộc đổi mới, đẩy mạnh công nghiệp hóa, hiện đại hóa và hội nhập quốc tế (1986 – nay)',
    shortTitle: 'Công cuộc đổi mới & Hội nhập quốc tế (1986–nay)',
    description: 'Đại hội VI (1986) mở đầu Đổi mới, các Cương lĩnh 1991, 2011, đẩy mạnh CNH-HĐH và hội nhập quốc tế',
  },
};

export function getSectionInfo(sectionId) {
  return SECTIONS_CONFIG[sectionId] || null;
}


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
