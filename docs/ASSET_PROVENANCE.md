# 추가 에셋 제작 기록

## 익스클루시브 방앗간

- 파일: `art/exclusive_bangat.png`, 1254×1254 RGBA, 투명 배경.
- 제작: 기본 ImageGen 도구. 기존 `art/bangat.png`는 화풍과 시점 참고 이미지로만 사용했다. 기존 건물을 덮어쓰지 않았다.
- 게임 내 크기: 원화 좌표256×256, 지면 기준점128,248, 월드 스케일1.6. 기존2×2 설치물 ID와 저장 좌표를 유지한다.
- 동작: 가공 중에는 코드로 밝은 가루 입자를 띄운다. 별도 애니메이션 프레임 이미지는 만들지 않았다.
- 프롬프트:

> Use case: stylized-concept. Asset: transparent PNG building sprite for Pangpang Farm, a warm Korean countryside farming game. Reference image is STYLE AND CAMERA reference, not edit target. Create one exclusive Korean traditional grain mill pavilion, elevated 3/4 isometric view matching reference exactly: tiny warm hand-painted game sprite, crisp brown outlines, honey wooden beams, terracotta golden tiled roof with gently upturned Korean eaves, round gray millstone, grain sack, small tasteful brass ornament as commemorative detail. Entire single building visible, centered with transparent margin, bottom ground contact centered, no surrounding scenery, no ground tile. Similar compact square footprint to reference. Clear small-scale silhouette, warm cozy colors, no characters, no text, no UI, no border, no watermarks. True transparent background. This is a new dedicated mill art asset, not a sheet; one building only.

## 음악 3곡

| 파일 | 제목 | 용도 | 길이 |
|---|---|---|---|
| audio/morning.mp3 | 햇살 든 텃밭 | 맑은 낮 | 96초 |
| audio/evening.mp3 | 처마 아래 저녁 | 오후5시 이후 | 약96초 |
| audio/rain.mp3 | 빗방울과 작은 연못 | 비 오는 날 | 96초 |

- 새로 작성한 음표와 절차적 합성으로 제작했다. 외부 곡, 샘플, 연주 녹음을 사용하지 않았다.
- 오음음계 중심의 부드러운 발현악기/피리풍 음색, 느린 선율과 낮은 배음 반주. 실제 가야금·대금 연주 녹음이라고 표현하지 않는다.
- 재현용 생성기: `scripts/compose_farm_music.py` (numpy, ffmpeg 필요).
- 오디오 파일 디코딩, 길이, 유효 샘플, 최대 진폭을 검사했다. 주관적 청취 품질과 모바일 실기기 검증은 별도다.
- `audio/player.js`: 곡별1회 디코딩 캐시, 루프, 상황 변경 크로스페이드, 독립 볼륨, 늦게 완료된 다운로드 재생 취소.

기존 하단 아이콘4장은 이전에 전달받은 원본을 그대로 유지한다. 이번 제작으로 교체하거나 글자를 추가하지 않았다.

## 밤 화면

밤 분위기 검토용 이미지는 ImageGen으로 기존 게임 스크린샷의 조명만 바꾼 AI 시안이다. 게임 파일로 삽입하지 않는다. 실제 게임에서는 기존 원화를 유지하고 시간별 화면 조명 마스크·창문 폴리곤·설치물의 광원을 코드로 합성한다. 밤 전용 배경/건물 PNG를 추가하지 않았다.
