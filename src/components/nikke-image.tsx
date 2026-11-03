"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

// blablalink CDN 핫링크. next/image 최적화를 쓰면 우리 서버가 사본을 만들기 때문에 img를 그대로 쓴다.
// 해시 경로가 바뀌거나 CDN이 막히면 fallback을 대신 보여 준다.
export function NikkeImage({
  src,
  alt,
  className,
  fallback,
  lazy = false,
}: {
  src: string;
  alt: string;
  className: string;
  fallback: ReactNode;
  lazy?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // 하이드레이션 전에 이미 실패한 이미지는 onError가 다시 오지 않아서 마운트 때 한 번 확인한다.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return fallback;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
