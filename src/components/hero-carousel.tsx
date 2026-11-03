"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const INTERVAL = 5_000;
const SLIDE_MS = 700;
// 이만큼 넘게 끌면 옆 장으로 넘긴다. 그보다 짧으면 제자리로 돌아온다.
const SWIPE_PX = 60;
// 이만큼 넘게 움직였으면 드래그로 보고, 손을 뗄 때의 링크 클릭을 막는다.
const CLICK_SLOP_PX = 6;

// 기능 소개 슬라이드. 5초마다 오른쪽에서 왼쪽으로 넘어가고, 마우스나 손가락으로 끌어서 넘길 수도 있다.
// 트랙 양 끝에 마지막 장과 첫 장 사본을 붙여 두고, 사본에 도착하면 전환 없이 진짜 장으로 바꿔서 되감기 없이 계속 같은 방향으로 흐른다.
export function HeroCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const count = slides.length;
  // -1은 앞쪽 사본(마지막 장), count는 뒤쪽 사본(첫 장)이다.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState<number | null>(null);
  const drag = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const active = (index + count) % count;

  const go = (next: number) => {
    setAnimate(true);
    setIndex(next);
  };

  // index가 바뀔 때마다 타이머를 새로 건다. 점을 누르거나 끌어서 옮겨도 거기서 5초를 다시 센다.
  useEffect(() => {
    // 사본에 도착하면 전환이 끝난 뒤 진짜 장으로 바꾼다. 두 장이 똑같아서 눈에 띄지 않는다.
    // transitionend는 움직임 줄이기 설정이나 백그라운드 탭에서 오지 않을 수 있어서 시간으로 맞춘다.
    if (index === count || index === -1) {
      const snap = setTimeout(() => {
        setAnimate(false);
        setIndex(index === count ? 0 : count - 1);
      }, SLIDE_MS);
      return () => clearTimeout(snap);
    }
    if (paused || dragX !== null) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, dragX, count]);

  const endDrag = () => {
    if (dragX === null) return;
    if (dragX <= -SWIPE_PX) go(index + 1);
    else if (dragX >= SWIPE_PX) go(index - 1);
    else go(index);
    setDragX(null);
  };

  const track = [slides[count - 1], ...slides, slides[0]];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="기능 소개"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className={`flex touch-pan-y select-none ${dragX === null ? "cursor-grab" : "cursor-grabbing"} ${
            animate && dragX === null ? "transition-transform ease-[var(--ease-out)] motion-reduce:transition-none" : ""
          }`}
          style={{
            transform: `translateX(calc(${-(index + 1) * 100}% + ${dragX ?? 0}px))`,
            transitionDuration: `${SLIDE_MS}ms`,
          }}
          onPointerDown={(event) => {
            if (event.button !== 0 || index === count || index === -1) return;
            drag.current = { startX: event.clientX, startY: event.clientY, moved: false };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start) return;
            const dx = event.clientX - start.startX;
            if (!start.moved) {
              if (Math.abs(dx) < CLICK_SLOP_PX) return;
              // 세로로 먼저 움직였으면 페이지 스크롤로 넘긴다.
              if (Math.abs(event.clientY - start.startY) > Math.abs(dx)) {
                drag.current = null;
                return;
              }
              start.moved = true;
              event.currentTarget.setPointerCapture(event.pointerId);
            }
            setDragX(dx);
          }}
          onPointerUp={() => {
            if (!drag.current) return;
            endDrag();
            // click 이벤트가 pointerup 다음에 오므로 moved는 그때까지 남겨 둔다.
            setTimeout(() => (drag.current = null));
          }}
          onPointerCancel={() => {
            endDrag();
            drag.current = null;
          }}
          onClickCapture={(event) => {
            if (drag.current?.moved) event.preventDefault();
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          {track.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${((i - 1 + count) % count) + 1} / ${count}: ${labels[(i - 1 + count) % count]}`}
              aria-hidden={i !== index + 1}
              inert={i !== index + 1}
              className="w-full shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-4 mx-auto flex max-w-[1400px] gap-1 px-2 md:bottom-6 md:px-8">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-label={`${label} 소개 보기`}
            aria-current={i === active}
            onClick={() => go(i)}
            className="group p-2"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-ink" : "w-1.5 bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
