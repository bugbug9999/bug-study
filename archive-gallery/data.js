const archiveData = [
    // === DOJ EPSTEIN LIBRARY - 공식 공개 자료 ===
    // 출처: https://www.justice.gov/epstein

    // --- 사건별 분류 (Primary Sources) ---
    {
        id: 1,
        title: "플로리다 사건 기록 (Florida Case)",
        description: "2000년대 중반 플로리다 팜비치 카운티 조사 자료. 기소장 초안, 피해자 진술서, 수사 기록 포함.",
        fullText: "플로리다 팜비치 카운티에서 진행된 최초의 엡스틴 수사 기록입니다. 2006년 기소장 초안, 피해자 인터뷰 기록, 수사관 메모가 포함되어 있습니다. 이 사건은 논란이 된 2008년 불기소 합의(NPA)로 이어졌습니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 2,
        title: "뉴욕 사건 기록 (New York Case)",
        description: "2019년 뉴욕 남부지검(SDNY) 기소 관련 법원 기록 및 증거물 목록.",
        fullText: "2019년 7월 체포 이후 뉴욕 남부지검이 수집한 모든 수사 자료입니다. 맨해튼 저택 압수수색에서 확보한 증거물, FBI 수사관 인터뷰 노트, 법원 제출 서류가 포함됩니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 3,
        title: "길레인 맥스웰 재판 (Maxwell Trial)",
        description: "2021년 맥스웰 형사재판 증거물 전체. 피해자 증언, 이메일, 사진, 재무 기록.",
        fullText: "길레인 맥스웰 재판에서 제출된 모든 증거물입니다. 피해자 증언 녹취록, 엡스틴-맥스웰 간 이메일 교환 내용, 재무 거래 기록, 부동산 관련 문서가 포함됩니다. 맥스웰은 5개 혐의로 유죄 판결을 받았습니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/usao-sdny/us-v-ghislaine-maxwell-trial-exhibits",
        date: "2021-12-01"
    },
    {
        id: 4,
        title: "엡스틴 사망 조사 (Death Investigation)",
        description: "2019년 8월 MCC 뉴욕 구치소 사망 조사 기록. 감찰관 보고서 포함.",
        fullText: "엡스틴의 2019년 8월 10일 구금 중 사망에 대한 조사 기록입니다. 교정시설 CCTV(일부 손상), 교도관 진술, 부검 보고서, 법무부 감찰관(OIG) 독립 조사 보고서가 포함됩니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010ccdcc51?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 5,
        title: "FBI 수사 기록 (Multiple FBI Investigations)",
        description: "여러 FBI 수사에서 수집된 에이전트 인터뷰 노트, 피해자 면담 기록.",
        fullText: "연방수사국(FBI)이 엡스틴 관련 여러 수사에서 수집한 자료입니다. 수사관 인터뷰 노트, 피해자 진술서, 증인 면담 기록, 법 집행 통신 기록이 포함됩니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1526628653644-640a430638ce?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 6,
        title: "집사 사건 (Butler Investigation - FL)",
        description: "엡스틴의 전 집사에 대한 플로리다 수사 자료.",
        fullText: "엡스틴의 전 집사가 연루된 플로리다 사건 기록입니다. 집사의 증언, 팜비치 저택 내부 운영에 대한 정보, 고용 기록이 포함됩니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },

    // --- 주요 인물 관련 자료 ---
    {
        id: 7,
        title: "빌 클린턴 - 비행 기록 & 사진",
        description: "클린턴 전 대통령의 엡스틴 전용기 탑승 기록 및 함께 찍은 사진들.",
        fullText: "빌 클린턴 전 대통령이 엡스틴의 전용기 '롤리타 익스프레스'에 여러 차례 탑승한 기록이 포함되어 있습니다. 또한 클린턴이 맥스웰과 함께 수영장에서 찍은 사진, 핫터브에서의 사진 등이 공개되었습니다. FBI는 클린턴 관련 일부 주장을 조사했으나 '검증되지 않음' 또는 '신빙성 없음'으로 결론지었습니다.",
        category: "people",
        type: "image",
        url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 8,
        title: "도널드 트럼프 - 문서 수천 건",
        description: "트럼프 대통령이 수천 번 언급된 문서들. 일부 미검증 주장 포함.",
        fullText: "도널드 트럼프 대통령은 공개된 문서에서 수천 번 언급됩니다. 대부분은 일상적인 언급이나, 일부 미검증 성폭행 주장도 포함되어 있습니다. 법무부는 이 중 일부가 '근거 없고 허위인 선정적 주장'이라고 명시했습니다. 스티브 배넌과의 수백 건의 친근한 문자 메시지도 포함되어 있습니다.",
        category: "people",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010ccdcc51?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 9,
        title: "앤드류 왕자 - 충격 사진 공개",
        description: "바닥에 누운 여성 위에 네 발로 엎드린 앤드류 왕자 사진.",
        fullText: "2026년 1월 공개에서 가장 충격적인 사진 중 하나입니다. 앤드류 왕자(현 Andrew Mountbatten-Windsor)가 바닥에 누운 여성 위에 네 발로 엎드린 모습의 사진이 공개되었습니다. 여성의 얼굴은 삭제 처리되었고, 촬영 장소와 날짜는 미공개입니다. 앤드류의 이름은 문서에서 수백 번 언급되며, 버킹엄 궁 저녁 초대, 26세 러시아 여성 소개 제안 등의 내용도 포함되어 있습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1510511459019-5dee997dd5df?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 10,
        title: "스티브 배넌 - 이메일/문자 교환",
        description: "트럼프 전 수석전략가와 엡스틴 간 수백 건의 친근한 메시지.",
        fullText: "트럼프 전 대통령의 수석전략가였던 스티브 배넌과 엡스틴 사이의 수백 건의 문자 메시지와 이메일이 공개되었습니다. 두 사람 간의 친밀한 관계를 보여주는 내용이 포함되어 있습니다.",
        category: "people",
        type: "image",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },

    // --- 미디어 자료 ---
    {
        id: 11,
        title: "180,000장의 사진 아카이브",
        description: "맨해튼 저택, 팜비치, 리틀 세인트 제임스 섬에서 압수된 사진들.",
        fullText: "18만 장 이상의 사진이 공개되었습니다. 엡스틴의 뉴욕시 맨해튼 저택, 팜비치 저택, 미국령 버진아일랜드 개인 섬에서 압수된 사진들이 포함됩니다. 길레인 맥스웰의 새로운 머그샷도 공개되었습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 12,
        title: "2,000개 이상의 비디오",
        description: "수사 과정에서 확보된 비디오 자료. 일부는 리틀 세인트 제임스 섬 영상.",
        fullText: "2,000개 이상의 비디오가 공개되었습니다. 하원 민주당 의원들이 공개한 적 없는 엡스틴 프라이빗 아일랜드 '리틀 세인트 제임스'의 영상도 포함됩니다.",
        category: "sensitive",
        type: "video",
        url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },
    {
        id: 13,
        title: "350만 페이지 문서 아카이브",
        description: "개인 이메일, 법원 기록, 뉴스 스크랩, FBI 인터뷰 노트 등.",
        fullText: "총 350만 페이지 이상의 문서가 공개되었습니다. 엡스틴의 개인 이메일, FBI 수사관 인터뷰 노트, 법원 기록, 뉴스 스크랩, 플로리다 사건 기소장 초안 등이 포함됩니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein",
        date: "2026-01-30"
    },

    // --- 추가 핵심 자료 ---
    {
        id: 14,
        title: "비행 기록 전체 (Flight Logs)",
        description: "보잉 727 '롤리타 익스프레스' 및 걸프스트림 제트기 승객 명단.",
        fullText: "엡스틴의 전용기 비행 기록 전체입니다. 1990년대 후반부터 2000년대 중반까지의 비행 일지가 포함되어 있으며, 수많은 정치인, 사업가, 유명인의 이름이 기록되어 있습니다.",
        category: "aviation",
        type: "image",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Epstein_flight_logs_released_in_USA_v._Maxwell.pdf",
        date: "2024-01-03"
    },
    {
        id: 15,
        title: "블랙북 연락처 (Little Black Book)",
        description: "92페이지의 전 세계 정치인, 유명인, 사업가 연락처 명단.",
        fullText: "엡스틴의 개인 연락처 명단(일명 '블랙북')입니다. 92페이지에 걸쳐 전 세계 정치인, 기업인, 연예인들의 연락처가 기록되어 있습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted",
        date: "2015-11-30"
    }
];
