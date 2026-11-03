"use client";

import { type CSSProperties, type FormEvent, useRef, useState, useSyncExternalStore } from "react";
import { NikkeImage } from "@/components/nikke-image";
import { type Nikke, nikkeImageUrl, nikkes } from "@/data/nikkes";

export type QuizType = "silhouette" | "illust";
type Level = "easy" | "hard";

const ROUND = 10;

const typeLabel: Record<QuizType, string> = { silhouette: "실루엣", illust: "일러스트" };
const levelLabel: Record<Level, string> = { easy: "쉬움", hard: "어려움" };

type Question = {
  nikke: Nikke;
  choices: Nikke[];
  // 일러스트 문제에서 확대해 보여 줄 지점(%).
  focus: { x: number; y: number };
};

type Answer = { id: number; guess: string; correct: boolean };

type ModeRecord = { rounds: number; best: number; correct: number; answered: number };

type Records = Partial<Record<`${QuizType}-${Level}`, ModeRecord>>;

// TODO: Supabase 테이블이 생기면 로그인 사용자는 계정에 저장한다. 지금은 이 브라우저에만 남는다.
const STORAGE_KEY = "syuennote:quiz:v1";

function loadRecords(): Records {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// 가챠 기록과 같은 방식: 서버 렌더에서는 빈 기록, 브라우저에서 저장된 기록으로 바꾼다.
let cached: Records | null = null;
const listeners = new Set<() => void>();
const emptyRecords: Records = {};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRecords() {
  cached ??= loadRecords();
  return cached;
}

function setStoredRecords(next: Records) {
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 사생활 보호 모드 등에서는 저장 없이 계속 쓴다.
  }
  listeners.forEach((listener) => listener());
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 띄어쓰기, 쌍점, 대소문자는 따지지 않는다. "네온:블루오션"도 "네온 : 블루 오션"으로 본다.
function normalize(name: string) {
  return name.replace(/[\s:：]/g, "").toLowerCase();
}

function makeRound(): Question[] {
  return shuffle(nikkes)
    .slice(0, ROUND)
    .map((nikke) => ({
      nikke,
      choices: shuffle([nikke, ...shuffle(nikkes.filter((other) => other.id !== nikke.id)).slice(0, 3)]),
      // 카드 이미지는 위쪽 절반에 얼굴과 머리가 있어서 그 근처를 확대한다.
      focus: { x: 25 + Math.random() * 50, y: 15 + Math.random() * 45 },
    }));
}

export function QuizGame({ initialType }: { initialType: QuizType }) {
  const [type, setType] = useState<QuizType>(initialType);
  const [level, setLevel] = useState<Level>("easy");
  const [round, setRound] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  // 답을 낸 뒤 다음 문제로 넘어가기 전까지 정답을 보여 준다.
  const [revealed, setRevealed] = useState(false);
  // 끝난 판의 결과. 새 판을 시작하면 지운다.
  const [finished, setFinished] = useState<Answer[] | null>(null);
  const records = useSyncExternalStore(subscribe, getRecords, () => emptyRecords);

  const index = answers.length;
  const current = round?.[index];

  function start() {
    setRound(makeRound());
    setAnswers([]);
    setRevealed(false);
    setFinished(null);
  }

  function answer(guess: string) {
    if (!current || revealed) return;
    const correct = normalize(guess) === normalize(current.nikke.name);
    setAnswers([...answers, { id: current.nikke.id, guess, correct }]);
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    if (answers.length < ROUND) return;
    // 한 판이 끝나면 기록을 남긴다.
    const key = `${type}-${level}` as const;
    const score = answers.filter((item) => item.correct).length;
    const prev = records[key] ?? { rounds: 0, best: 0, correct: 0, answered: 0 };
    setStoredRecords({
      ...records,
      [key]: {
        rounds: prev.rounds + 1,
        best: Math.max(prev.best, score),
        correct: prev.correct + score,
        answered: prev.answered + ROUND,
      },
    });
    setRound(null);
    setFinished(answers);
  }

  function reset() {
    if (!window.confirm("퀴즈 기록을 모두 지울까요? 되돌릴 수 없습니다.")) return;
    setStoredRecords({});
  }

  const last = answers.at(-1);
  const shown = revealed ? round?.[index - 1] : current;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-label="퀴즈">
        {shown ? (
          <>
            <p className="flex justify-between text-sm font-bold text-ink-2">
              <span>
                {typeLabel[type]} · {levelLabel[level]}
              </span>
              <span className="tabular-nums">
                {revealed ? index : index + 1} / {ROUND} · 정답 {answers.filter((item) => item.correct).length}
              </span>
            </p>
            <div className="mt-3 grid gap-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
              <QuizImage key={shown.nikke.id} question={shown} type={type} revealed={revealed} onSkip={() => answer("")} />
              <div>
                {revealed && last ? (
                  <Feedback answer={last} nikke={shown.nikke} onNext={next} lastQuestion={index === ROUND} />
                ) : level === "easy" ? (
                  <Choices question={shown} onAnswer={answer} />
                ) : (
                  <NameInput key={shown.nikke.id} onAnswer={answer} />
                )}
              </div>
            </div>
          </>
        ) : (
          <Setup
            type={type}
            level={level}
            onType={setType}
            onLevel={setLevel}
            onStart={start}
            finished={finished}
          />
        )}
      </section>

      <aside className="grid content-start gap-4">
        <div className="rounded-xl bg-raise p-5">
          <h2 className="font-extrabold">퀴즈 기록</h2>
          <dl className="mt-3 grid gap-3">
            {(["silhouette", "illust"] as const).flatMap((t) =>
              (["easy", "hard"] as const).map((l) => {
                const record = records[`${t}-${l}`];
                return (
                  <div key={`${t}-${l}`} className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0">
                    <dt className="text-sm font-bold">
                      {typeLabel[t]} <span className="text-ink-2">{levelLabel[l]}</span>
                    </dt>
                    <dd className="text-right text-sm tabular-nums text-ink-2">
                      {record ? (
                        <>
                          최고 <span className="font-black text-ink">{record.best}</span>/{ROUND} · 정답률{" "}
                          {Math.round((record.correct / record.answered) * 100)}% · {record.rounds}판
                        </>
                      ) : (
                        "기록 없음"
                      )}
                    </dd>
                  </div>
                );
              }),
            )}
          </dl>
          <button type="button" onClick={reset} className="mt-2 -ml-3 min-h-11 px-3 text-sm font-bold text-ink-2 hover:text-ink">
            기록 초기화
          </button>
        </div>
      </aside>
    </div>
  );
}

function Setup({
  type,
  level,
  onType,
  onLevel,
  onStart,
  finished,
}: {
  type: QuizType;
  level: Level;
  onType: (type: QuizType) => void;
  onLevel: (level: Level) => void;
  onStart: () => void;
  finished: Answer[] | null;
}) {
  const byId = new Map(nikkes.map((nikke) => [nikke.id, nikke]));
  return (
    <div className="grid gap-5">
      {finished && (
        <div className="rounded-xl bg-raise p-5">
          <h2 className="text-2xl font-black tracking-[-0.02em]">
            {finished.filter((item) => item.correct).length} / {ROUND} 정답
          </h2>
          <ol className="mt-3 grid gap-1 sm:grid-cols-2 sm:gap-x-6">
            {finished.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 border-b border-line py-2 text-sm">
                <span className="font-bold">{byId.get(item.id)?.name}</span>
                <span className={`shrink-0 font-bold ${item.correct ? "text-violet" : "text-ink-2"}`}>
                  {item.correct ? "정답" : item.guess ? `오답: ${item.guess}` : "넘김"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Toggle label="문제 유형" options={["silhouette", "illust"] as const} labels={typeLabel} value={type} onChange={onType} />
        <Toggle label="난이도" options={["easy", "hard"] as const} labels={levelLabel} value={level} onChange={onLevel} />
      </div>
      <p className="text-sm text-ink-2">
        {type === "silhouette" ? "검은 그림자만 보고" : "확대한 일러스트 일부를 보고"}{" "}
        {level === "easy" ? "보기 4개 중에서 이름을 고릅니다." : "이름을 직접 입력합니다. 띄어쓰기와 쌍점은 따지지 않습니다."} 한 판은{" "}
        {ROUND}문제입니다.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="min-h-12 justify-self-start rounded-lg bg-ink px-8 text-base font-extrabold text-ground transition-opacity hover:opacity-85"
      >
        {finished ? "한 판 더" : "시작하기"}
      </button>
    </div>
  );
}

function Toggle<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-raise p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className="min-h-11 rounded-md px-4 text-sm font-extrabold text-ink-2 aria-pressed:bg-raise-2 aria-pressed:text-ink"
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

// 실루엣은 카드 위쪽(머리와 상반신)만 잘라 검게 칠한다. 아래쪽은 카드 폭을 꽉 채워 모양이 드러나지 않는다.
// 일러스트는 한 지점을 크게 확대한다. 답을 내면 둘 다 원래 카드로 돌아온다.
function QuizImage({
  question,
  type,
  revealed,
  onSkip,
}: {
  question: Question;
  type: QuizType;
  revealed: boolean;
  onSkip: () => void;
}) {
  const { nikke, focus } = question;
  const hidden = !revealed;
  const effect = !hidden ? "" : type === "silhouette" ? "brightness-0" : "scale-300";
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-64 overflow-hidden rounded-xl bg-raise md:max-w-none"
      style={{ "--fx": `${focus.x}%`, "--fy": `${focus.y}%` } as CSSProperties}
    >
      {/* 검은 실루엣이 바탕에 묻히지 않게 뒤를 밝힌다. */}
      {type === "silhouette" && (
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,#4a3570,transparent)]" />
      )}
      <div className="absolute inset-0">
        <NikkeImage
          src={nikkeImageUrl(nikke)}
          alt={revealed ? nikke.name : "문제 이미지"}
          className={`size-full origin-[var(--fx)_var(--fy)] object-cover object-top transition-[filter,scale] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${effect}`}
          fallback={
            <div className="grid size-full place-items-center p-6 text-center">
              {revealed ? (
                <span className="text-3xl font-black tracking-[-0.03em]">{nikke.name}</span>
              ) : (
                <div>
                  <p className="text-ink-2">이미지를 불러오지 못했습니다.</p>
                  <button type="button" onClick={onSkip} className="mt-3 min-h-11 rounded-lg border border-line px-4 text-sm font-extrabold">
                    이 문제 넘기기
                  </button>
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}

function Choices({ question, onAnswer }: { question: Question; onAnswer: (name: string) => void }) {
  return (
    <div>
      <h2 className="text-xl font-black tracking-[-0.02em]">이 니케는 누구일까요?</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {question.choices.map((choice) => (
          <li key={choice.id}>
            <button
              type="button"
              onClick={() => onAnswer(choice.name)}
              className="min-h-14 w-full rounded-lg bg-raise-2 px-4 text-left text-base font-extrabold hover:bg-line"
            >
              {choice.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NameInput({ onAnswer }: { onAnswer: (name: string) => void }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const query = normalize(value);
  const suggestions = query ? nikkes.filter((nikke) => normalize(nikke.name).includes(query)).slice(0, 6) : [];

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value.trim()) onAnswer(value.trim());
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="quiz-answer" className="text-xl font-black tracking-[-0.02em]">
        이 니케는 누구일까요?
      </label>
      <div className="mt-4 flex gap-2">
        <input
          id="quiz-answer"
          ref={inputRef}
          autoFocus
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="니케 이름"
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-raise px-4 text-base text-ink placeholder:text-ink-2"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-lg bg-ink px-5 font-extrabold text-ground hover:opacity-85">
          확인
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul aria-label="이름 자동완성" className="mt-2 grid gap-1">
          {suggestions.map((nikke) => (
            <li key={nikke.id}>
              <button
                type="button"
                onClick={() => {
                  setValue(nikke.name);
                  inputRef.current?.focus();
                }}
                className="min-h-11 w-full rounded-md px-3 text-left text-sm font-bold text-ink-2 hover:bg-raise hover:text-ink"
              >
                {nikke.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => onAnswer("")} className="mt-3 -ml-3 min-h-11 px-3 text-sm font-bold text-ink-2 hover:text-ink">
        모르겠어요
      </button>
    </form>
  );
}

function Feedback({
  answer,
  nikke,
  onNext,
  lastQuestion,
}: {
  answer: Answer;
  nikke: Nikke;
  onNext: () => void;
  lastQuestion: boolean;
}) {
  return (
    <div>
      <p aria-live="polite" className={`text-2xl font-black tracking-[-0.02em] ${answer.correct ? "text-violet" : "text-ink"}`}>
        {answer.correct ? "정답!" : answer.guess ? "아쉬워요" : "넘겼습니다"}
      </p>
      <p className="mt-2 text-lg font-bold">{nikke.name}</p>
      <p className="mt-1 text-sm text-ink-2">
        {nikke.manufacturer} · {nikke.class} · {nikke.weapon} · 버스트 {nikke.burst}
      </p>
      {!answer.correct && answer.guess && <p className="mt-2 text-sm text-ink-2">내 답: {answer.guess}</p>}
      <button
        type="button"
        autoFocus
        onClick={onNext}
        className="mt-5 min-h-12 rounded-lg bg-ink px-8 text-base font-extrabold text-ground transition-opacity hover:opacity-85"
      >
        {lastQuestion ? "결과 보기" : "다음 문제"}
      </button>
    </div>
  );
}
