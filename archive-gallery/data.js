const archiveData = [
    {
        id: 1,
        title: "DOJ Epstein Library - Full Release (Jan 2026)",
        description: "The official 3.5 million document release under the Transparency Act. Includes court records, disclosure memos, and personal correspondence.",
        fullText: "2025년 투명성법에 따라 미 법무부가 공개한 최종 아카이브입니다. 총 350만 건의 문서, 18만 장의 이미지, 2,000개 이상의 비디오를 포함하고 있습니다. 일부 피해자 보호를 위한 삭제 처리가 되어 있으나, 법원 기록 및 개인 서신의 핵심 내용이 공개되어 있습니다. 접근 시 18세 이상 확인이 필요합니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein-library",
        date: "2026-01-30"
    },
    {
        id: 2,
        title: "Prince Andrew: Newly Released Photos",
        description: "180,000 images released include multiple photographs of Prince Andrew at Epstein properties and events.",
        fullText: "영국 앤드류 왕자가 엡스틴의 뉴욕 맨해튼 저택 및 플로리다 팜비치 저택에서 촬영된 사진들이 다수 포함되어 있습니다. 특히 2001년경 촬영된 것으로 추정되는 사진들이 언론에 집중 보도되었습니다. 왕실 측은 사진의 맥락에 대해 이의를 제기하고 있습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1510511459019-5dee997dd5df?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein-library",
        date: "2026-01-20"
    },
    {
        id: 3,
        title: "Flight Logs: Complete Passenger Manifests",
        description: "All flight records for the Boeing 727 'Lolita Express' and Gulfstream jets. Names of passengers and destinations.",
        fullText: "엡스틴의 전용기 '롤리타 익스프레스'(Boeing 727-100, N908JE) 및 걸프스트림 제트기의 전체 승객 명단입니다. 1990년대 후반부터 2000년대 중반까지의 비행 일지가 포함되어 있으며, 다수의 정치인, 사업가, 연예인의 이름이 기록되어 있습니다.",
        category: "aviation",
        type: "image",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Epstein_flight_logs_released_in_USA_v._Maxwell.pdf",
        date: "2024-01-03"
    },
    {
        id: 4,
        title: "Little Black Book: Unredacted Contacts",
        description: "The complete 92-page address book with contacts for politicians, celebrities, and business leaders.",
        fullText: "엡스틴의 개인 연락처 명단(일명 '블랙북')의 완전한 버전입니다. 92페이지에 걸쳐 전 세계 각국의 정치인, 기업인, 연예인들의 연락처가 기록되어 있습니다. 일부 이름은 피해자 보호를 위해 삭제 처리되었습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted",
        date: "2015-11-30"
    },
    {
        id: 5,
        title: "Russian Intelligence Connection (Feb 2026)",
        description: "Latest intel memos suggesting Epstein operated a blackmail network for foreign intelligence services.",
        fullText: "2026년 2월 공개된 정보 기관 메모에 따르면, 엡스틴이 러시아 정보국(GRU)을 위해 서방 인사들에 대한 협박 자료를 수집했을 가능성이 제기되었습니다. 엡스틴의 네트워크가 푸틴 정권에 유용한 정보를 제공했다는 주장이 포함되어 있으며, 현재 조사가 진행 중입니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1526628653644-640a430638ce?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://united24media.com",
        date: "2026-02-01"
    },
    {
        id: 6,
        title: "Little Saint James: Drone Surveillance",
        description: "High-resolution aerial imagery of the private island, including the 'Temple' structure and underground areas.",
        fullText: "엡스틴의 개인 섬 '리틀 세인트 제임스'의 드론 촬영 영상에서 캡처된 고해상도 이미지입니다. 특히 논란이 되었던 '템플' 건물과 지하 구조물의 입구가 명확히 확인됩니다. 섬 내부의 직원 숙소, 헬리콥터 착륙장, 선착장 등의 모습도 포함되어 있습니다.",
        category: "islands",
        type: "image",
        url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/epstein-library",
        date: "2020-01-15"
    },
    {
        id: 7,
        title: "Bill Clinton: Pool Photo with Maxwell",
        description: "Released photograph showing former President Clinton with Ghislaine Maxwell at an undisclosed location.",
        fullText: "빌 클린턴 전 미국 대통령이 길레인 맥스웰과 함께 수영장에서 찍은 사진이 2025년 12월 공개되었습니다. 사진의 촬영 장소와 날짜는 확인되지 않았으나, 클린턴 측은 맥스웰과의 친분을 부인하지 않고 있습니다.",
        category: "people",
        type: "image",
        url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.pbs.org",
        date: "2025-12-20"
    },
    {
        id: 8,
        title: "U.S. v. Maxwell: Trial Evidence Archive",
        description: "Complete exhibit list and evidence from the 2021 criminal trial of Ghislaine Maxwell.",
        fullText: "2021년 길레인 맥스웰 재판에서 제출된 모든 증거 목록입니다. 피해자 증언 기록, 이메일 교환 내용, 사진 자료, 재무 기록 등이 포함되어 있습니다. 맥스웰은 성매매 및 인신매매 관련 혐의로 유죄 판결을 받았습니다.",
        category: "legal",
        type: "image",
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.justice.gov/usao-sdny/us-v-ghislaine-maxwell-trial-exhibits",
        date: "2021-12-01"
    },
    {
        id: 9,
        title: "Trump Flight Records Contradiction",
        description: "Documents show Trump flew on Epstein's plane multiple times, contradicting 2024 denials.",
        fullText: "2025-2026년 공개된 문서에 따르면, 도널드 트럼프가 1990년대에 엡스틴의 전용기에 여러 차례 탑승한 것으로 나타났습니다. 이는 트럼프가 2024년에 '엡스틴의 비행기를 탄 적이 없다'고 부인한 것과 모순됩니다. 일부 이메일에는 마르알라고 방문 계획도 포함되어 있습니다.",
        category: "sensitive",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010ccdcc51?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.rnz.co.nz",
        date: "2026-01-15"
    },
    {
        id: 10,
        title: "Elon Musk Correspondence",
        description: "Emails between Epstein and Elon Musk revealed deeper ties than previously known.",
        fullText: "2025년 11월 공개된 이메일에서 엘론 머스크와 엡스틴 사이의 연락 내용이 확인되었습니다. 머스크 측은 엡스틴과의 관계를 부인해 왔으나, 공개된 이메일은 여러 차례의 만남과 비즈니스 논의가 있었음을 시사합니다.",
        category: "people",
        type: "image",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
        sourceUrl: "https://www.theguardian.com",
        date: "2025-11-20"
    }
];

{
    id: 101,
        title: "[LIVE] Russian Honeytrap Intel (Feb 2026)",
            description: "Latest intelligence reports suggesting Epstein operated a blackmail ring for Russian intelligence. 2026 unsealed memos confirm ties to various foreign agents.",
                category: "sensitive",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1526628653644-640a430638ce?auto=format&fit=crop&q=80&w=1200", // Representative tech/intel still
                            date: "2026-02-01"
},
{
    id: 102,
        title: "[LIVE] Prince Andrew Evidence (Jan 2026)",
            description: "Newly released photographs show Prince Andrew in compromising positions, part of the 180,000 image dump from the FBI evidence vault.",
                category: "sensitive",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1510511459019-5dee997dd5df?auto=format&fit=crop&q=80&w=1200", // Representative legal focus
                            date: "2026-01-20"
},
{
    id: 103,
        title: "[LIVE] 300GB FBI Evidence Vault Unsealed",
            description: "Under the 2025 Transparency Act, the DOJ has finished processing millions of pages and thousands of videos from the 2019 raid.",
                category: "legal",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1558494949-ef010ccdcc51?auto=format&fit=crop&q=80&w=1200", // Servers/Data
                            date: "2025-11-19"
},
{
    id: 1,
        title: "Epstein Flight Logs (Lolita Express)",
            description: "Official flight manifests for the Boeing 727 (N908JE) and other aircraft. Contains names of high-profile passengers from 1990s-2000s.",
                category: "aviation",
                    type: "image",
                        url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Epstein_flight_logs_released_in_USA_v._Maxwell.pdf",
                            date: "2024-01-03"
},
{
    id: 2,
        title: "The Black Book (Leaked Contact List)",
            description: "The complete 92-page address book containing contacts for politicians, celebrities, and business leaders worldwide.",
                category: "sensitive",
                    type: "image",
                        url: "https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted",
                            date: "2015-11-30"
},
{
    id: 3,
        title: "Palm Beach Indictment - Unsealed Witness Stills",
            description: "Surveillance and identification stills presented as evidence during the Florida investigation. Focus on room interiors and entry points.",
                category: "sensitive",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200", // Representative still
                            date: "2019-07-20"
},
{
    id: 4,
        title: "Little Saint James - Drone Scoping (The Temple)",
            description: "High-resolution stills of the infamous 'Temple' structure. Detailed architectural analysis of the unusual building features.",
                category: "sensitive",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1200", // Representative still
                            date: "2020-01-15"
},
{
    id: 5,
        title: "U.S. v. Maxwell - Discovery Document Suite",
            description: "Thousands of pages of unsealed testimony and physical evidence logs from the 2021 criminal trial.",
                category: "legal",
                    type: "image",
                        url: "https://www.justice.gov/usao-sdny/us-v-ghislaine-maxwell-trial-exhibits",
                            date: "2021-12-01"
},
{
    id: 6,
        title: "Redacted Identification Photos",
            description: "Evidence photos showing specific body markings and physical traits mentioned in victim testimonies.",
                category: "sensitive",
                    type: "image",
                        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200", // Representative still
                            date: "2006-05-12"
},
{
    id: 7,
        title: "CBP Records: International Travel Manifests",
            description: "U.S. Customs and Border Protection logs of international arrivals and departures at private hangars.",
                category: "aviation",
                    type: "image",
                        url: "https://www.cbp.gov/sites/default/files/assets/documents/2021-May/Jeffrey%20Epstein%20Records.pdf",
                            date: "2021-05-15"
}
];
