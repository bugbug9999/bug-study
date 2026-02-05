/**
 * Date Utilities for PM Dashboard
 * D-day 계산 및 날짜 포맷팅 함수
 */

const DateUtils = {
    /**
     * 오늘 날짜 기준 D-day 계산
     */
    calculateDday(targetDate) {
        const target = new Date(targetDate);
        const today = new Date();

        target.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    },

    /**
     * D-day 문자열 포맷팅
     */
    formatDday(dday) {
        if (dday === 0) return 'D-Day';
        if (dday > 0) return `D-${dday}`;
        return `D+${Math.abs(dday)}`;
    },

    /**
     * 날짜 포맷팅 (YYYY-MM-DD)
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 날짜 포맷팅 (한국어)
     */
    formatDateKorean(date) {
        const d = new Date(date);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return `${month}월 ${day}일`;
    },

    /**
     * 월 이름 배열 (한국어)
     */
    MONTH_NAMES_KO: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ],

    /**
     * 두 날짜 사이의 월 목록 생성
     */
    getMonthsBetween(startDate, endDate) {
        const months = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setDate(1);
        end.setDate(1);

        while (start <= end) {
            months.push({
                year: start.getFullYear(),
                month: start.getMonth(),
                name: this.MONTH_NAMES_KO[start.getMonth()]
            });
            start.setMonth(start.getMonth() + 1);
        }

        return months;
    },

    /**
     * 타임라인에서 날짜의 위치 계산 (퍼센트)
     */
    calculateTimelinePosition(date, timelineStart, timelineEnd) {
        const d = new Date(date).getTime();
        const start = new Date(timelineStart).getTime();
        const end = new Date(timelineEnd).getTime();

        const position = ((d - start) / (end - start)) * 100;
        return Math.max(0, Math.min(100, position));
    },

    /**
     * 태스크 막대의 너비 계산 (퍼센트)
     */
    calculateTimelineWidth(taskStart, taskEnd, timelineStart, timelineEnd) {
        const startPos = this.calculateTimelinePosition(taskStart, timelineStart, timelineEnd);
        const endPos = this.calculateTimelinePosition(taskEnd, timelineStart, timelineEnd);
        return Math.max(2, endPos - startPos);
    },

    /**
     * 임박 태스크 여부 확인 (D-2 이하)
     */
    isUrgent(deadline) {
        const dday = this.calculateDday(deadline);
        return dday <= 2 && dday >= 0;
    }
};
