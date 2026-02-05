# PM Dashboard

Lair Team PM Dashboard - 노션 연동 프로젝트 관리 대시보드

## 🚀 시작하기

### 로컬 테스트
`index.html` 파일을 브라우저에서 직접 열기

### 노션 연동 설정 (GitHub)

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. 다음 Secrets 추가:

| Name | Value |
|------|-------|
| `NOTION_TOKEN` | `ntn_360187...` (노션 Integration Token) |
| `NOTION_EPIC_DB` | `a59fb838094b48f1986817789defa508` |
| `NOTION_TASK_DB` | `21919bf807b34f778caf958301b06384` |
| `NOTION_DOCS_DB` | `c6c5aaebc4c94f7f85847ffd47b27096` |

3. **Actions** 탭 → **Sync Notion Data** → **Run workflow** 클릭

### GitHub Pages 배포

1. **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`, 폴더: `/(root)` 또는 `/pm-dashboard`
4. Save

## 📁 구조

```
pm-dashboard/
├── index.html           # 메인 페이지
├── css/                 # 스타일
├── js/                  # 스크립트
├── data/                # 노션에서 동기화된 데이터
├── scripts/             # 동기화 스크립트
└── .github/workflows/   # GitHub Actions
```

## 🔄 데이터 동기화

- 1시간마다 자동 실행
- 수동 실행: Actions → Sync Notion Data → Run workflow
