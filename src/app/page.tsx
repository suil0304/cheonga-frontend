"use client";

import { useRef, useState } from "react";

type Screen = "welcome" | "onboarding" | "consent-blocked" | "login" | "home";
type PermissionState =
  | "idle"
  | "requesting"
  | NotificationPermission
  | "unsupported"
  | "insecure"
  | "error";
type ChatMessage = { id: number; sender: "user" | "assistant"; text: string };
type TopicShortcut = {
  id: string;
  title: string;
  question: string;
  mark: string;
};

const steps = ["동의 안내", "도움 주제", "익숙한 정도", "안부 설정"];

const helpTopics = [
  {
    id: "public-welfare",
    title: "공공·복지 서비스",
    description: "필요한 서비스 찾기와 이용 방법",
    mark: "01",
  },
  {
    id: "smartphone",
    title: "스마트폰과 앱",
    description: "휴대전화에서 앱을 사용하는 방법",
    mark: "02",
  },
  {
    id: "kiosk",
    title: "키오스크",
    description: "화면을 눌러 주문하거나 신청하는 방법",
    mark: "03",
  },
  {
    id: "other",
    title: "다른 도움이 필요해요",
    description: "원하는 내용을 직접 적어 주세요",
    mark: "＋",
  },
];

const familiarityOptions = [
  { id: "new", title: "처음이에요", description: "천천히 하나씩 알려주세요" },
  {
    id: "some",
    title: "조금 해봤어요",
    description: "해본 적은 있지만 아직 어려워요",
  },
  {
    id: "comfortable",
    title: "어느 정도 할 수 있어요",
    description: "필요한 부분만 도움받고 싶어요",
  },
  { id: "unsure", title: "잘 모르겠어요", description: "대화하며 함께 찾아봐요" },
];

const checkInTimes = ["오전", "오후", "저녁"];
const checkInFrequencies = [2, 3] as const;
const quickQuestions = [
  { title: "복지 서비스 알아보기", question: "이용할 수 있는 복지 서비스를 알고 싶어요." },
  { title: "스마트폰 사용법", question: "스마트폰을 사용하는 방법을 알려주세요." },
  { title: "키오스크 이용하기", question: "키오스크 이용 방법을 알려주세요." },
];

function CheongaMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 40 40"
    >
      <path d="M7 15c4.3-4 8.7-4 13 0s8.7 4 13 0" />
      <path d="M7 23c4.3-4 8.7-4 13 0s8.7 4 13 0" />
    </svg>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [step, setStep] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [otherTopic, setOtherTopic] = useState("");
  const [familiarity, setFamiliarity] = useState("");
  const [checkInFrequency, setCheckInFrequency] = useState<2 | 3>(2);
  const [checkInTime, setCheckInTime] = useState("");
  const [permissionState, setPermissionState] =
    useState<PermissionState>("idle");
  const [loginNotice, setLoginNotice] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const conversationRef = useRef<HTMLElement>(null);

  function toggleTopic(topic: string) {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    );
  }

  function continueOnboarding() {
    if (step === 0 && !consentAccepted) return;

    if (step === steps.length - 1) {
      setLoginNotice(false);
      setScreen("login");
      return;
    }

    setStep((current) => current + 1);
  }

  function goBack() {
    if (step === 0) {
      setScreen("welcome");
      return;
    }
    setStep((current) => current - 1);
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
      return;
    }

    if (!window.isSecureContext) {
      setPermissionState("insecure");
      return;
    }

    if (Notification.permission !== "default") {
      setPermissionState(Notification.permission);
      return;
    }

    setPermissionState("requesting");
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
    } catch (error) {
      console.error("Could not request browser notification permission", error);
      setPermissionState("error");
    }
  }

  function resetPrototype() {
    setScreen("welcome");
    setStep(0);
    setConsentAccepted(false);
    setSelectedTopics([]);
    setOtherTopic("");
    setFamiliarity("");
    setCheckInFrequency(2);
    setCheckInTime("");
    setPermissionState("idle");
    setLoginNotice(false);
    setQuestion("");
    setChatMessages([]);
  }

  function sendQuestion(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatMessages((messages) => [
      ...messages,
      { id: Date.now(), sender: "user", text: trimmed },
      {
        id: Date.now() + 1,
        sender: "assistant",
        text: "아직 공식 교육 자료와 연결되지 않아 정확한 이용 방법을 확인할 수 없어요. 이 체험 화면에서는 확인되지 않은 안내를 만들어 말씀드리지 않아요.",
      },
    ]);
    setQuestion("");
  }

  function openTopic(questionText: string) {
    sendQuestion(questionText);
    requestAnimationFrame(() =>
      conversationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  }

  const topicShortcuts: TopicShortcut[] =
    selectedTopics.length > 0
      ? selectedTopics.map((topic) => {
          const item = helpTopics.find((helpTopic) => helpTopic.id === topic);
          const title =
            topic === "other" ? otherTopic.trim() || "다른 도움" : item?.title;
          const questionText =
            topic === "other"
              ? otherTopic.trim() || "다른 디지털 사용 방법을 알고 싶어요."
              : `${item?.title ?? "디지털 서비스"} 사용 방법을 알려주세요.`;
          return {
            id: topic,
            title: `${title} 사용법`,
            question: questionText,
            mark: item?.mark ?? "＋",
          };
        })
      : quickQuestions.map((item, index) => ({
          id: item.title,
          title: item.title,
          question: item.question,
          mark: ["복", "폰", "키"][index],
        }));

  const permissionMessage = {
    idle: "권한을 허용하지 않으면 정기 안부 알림은 이용할 수 없어요.",
    requesting: "브라우저에서 알림 권한을 확인하고 있어요.",
    granted:
      "알림 권한을 허용했어요. 이 데모는 실제 알림을 보내지 않습니다.",
    denied:
      "알림 권한이 거부되어 정기 안부를 이용할 수 없어요. 다른 방법으로 대신 연락하지 않습니다.",
    default:
      "알림 권한이 아직 결정되지 않았어요. 나중에 브라우저 설정에서 바꿀 수 있어요.",
    unsupported:
      "이 브라우저에서는 알림을 지원하지 않아 정기 안부를 이용할 수 없어요.",
    insecure:
      "안전한 연결(HTTPS)이 아니어서 권한을 요청할 수 없어요. 정기 안부는 이용할 수 없습니다.",
    error:
      "권한 창을 열지 못했어요. 브라우저 설정을 확인해 주세요. 정기 안부는 이용할 수 없습니다.",
  }[permissionState];
  const permissionSummary: Record<PermissionState, string> = {
    idle: "미요청",
    requesting: "요청 중",
    granted: "허용",
    denied: "거부",
    default: "미결정",
    unsupported: "지원되지 않음",
    insecure: "안전한 연결 필요",
    error: "요청 실패",
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          aria-label="청아 처음 화면으로"
          className="brand"
          onClick={resetPrototype}
          type="button"
        >
          <CheongaMark className="brand-mark" />
          <span className="brand-name">청아</span>
        </button>
        <span className="demo-badge">체험 화면</span>
      </header>

      {screen === "welcome" && (
        <section aria-labelledby="welcome-title" className="welcome-panel">
          <div className="welcome-art" aria-hidden="true">
            <div className="welcome-illustration">
              <div className="illustration-heading">
                <CheongaMark className="illustration-mark" />
                <span>청아가 알려드려요</span>
              </div>
              <p className="illustration-message">
                천천히 하셔도
                <br />
                괜찮아요.
              </p>
              <div className="illustration-tags">
                <span>쉬운 설명</span>
                <span>한 단계씩</span>
              </div>
              <span className="illustration-spark illustration-spark-one" />
              <span className="illustration-spark illustration-spark-two" />
            </div>
          </div>
          <div className="welcome-copy">
            <p className="eyebrow">천천히, 함께 시작해요</p>
            <h1 id="welcome-title">
              디지털 생활이
              <br />
              조금 더 편안해지도록
            </h1>
            <p className="welcome-description">
              청아가 필요한 서비스를 찾고 이용하는 방법을 쉬운 말로
              안내해 드릴게요.
            </p>
            <div className="welcome-points">
              <span>큰 글씨와 쉬운 설명</span>
              <span>한 단계씩 차근차근</span>
            </div>
            <button
              className="button button-primary button-large welcome-button"
              onClick={() => setScreen("onboarding")}
              type="button"
            >
              시작하기 <span aria-hidden="true">→</span>
            </button>
            <p className="demo-note">
              체험 화면입니다. 입력하신 내용은 저장되거나 전송되지 않습니다.
            </p>
          </div>
        </section>
      )}

      {screen === "onboarding" && (
        <section aria-labelledby="step-title" className="onboarding-panel">
          <div className="progress-area">
            <div className="progress-heading">
              <span className="step-count">
                {step + 1} <span>/ {steps.length}</span>
              </span>
              <span className="step-label">{steps[step]}</span>
            </div>
            <div
              aria-label={`전체 ${steps.length}단계 중 ${step + 1}단계`}
              className="progress-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={step + 1}
            >
              <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          <div className="step-content" key={step}>
            {step === 0 && (
              <>
                <p className="eyebrow">먼저 꼭 확인해 주세요</p>
                <h1 id="step-title">맞춤 안내를 위한 동의가 필요해요</h1>
                <p className="step-description">
                  어떤 정보가 쓰이는지 쉬운 말로 안내해 드릴게요.
                </p>

                <div className="notice-card">
                  <span aria-hidden="true" className="notice-icon">
                    i
                  </span>
                  <p>
                    청아는 응급 상황을 감지하거나 가족·기관에 알리는
                    서비스가 아니에요.
                  </p>
                </div>

                <div className="consent-card">
                  <h2>맞춤 안내에 사용하는 정보</h2>
                  <ul className="consent-list">
                    <li>
                      <span className="list-check" aria-hidden="true">
                        ✓
                      </span>
                      선택하신 관심 주제와 익숙한 정도를 저장해요.
                    </li>
                    <li>
                      <span className="list-check" aria-hidden="true">
                        ✓
                      </span>
                      Google 계정의 이름은 대화 중 부르는 데 사용해요.
                    </li>
                    <li>
                      <span className="list-check" aria-hidden="true">
                        ✓
                      </span>
                      맞춤 답변에 필요한 대화 내용과 정보가 AI/MCP 처리
                      시스템으로 전달될 수 있어요.
                    </li>
                    <li>
                      <span className="list-check" aria-hidden="true">
                        ✓
                      </span>
                      청아는 대화 원문을 저장하지 않아요. 외부 처리 시스템의
                      보관 조건은 확인이 필요해요.
                    </li>
                  </ul>
                </div>

                <div className="demo-disclosure" role="note">
                  <strong>체험 화면 안내</strong>
                  <p>
                    지금은 실제 로그인이나 정보 저장·전송을 하지 않아요.
                    실제 서비스 시작 전 AI/MCP 처리 시스템의 보관 조건을
                    확인할 예정이에요.
                  </p>
                </div>

                <label className="consent-control">
                  <input
                    checked={consentAccepted}
                    onChange={(event) =>
                      setConsentAccepted(event.currentTarget.checked)
                    }
                    type="checkbox"
                  />
                  <span className="custom-checkbox" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    위 내용을 확인했고, 맞춤 정보 저장과 처리에 동의합니다.
                    <strong> (필수)</strong>
                  </span>
                </label>
                <button
                  className="decline-link"
                  onClick={() => setScreen("consent-blocked")}
                  type="button"
                >
                  동의하지 않아요
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <p className="eyebrow">2단계 · 복수 선택할 수 있어요</p>
                <h1 id="step-title">어떤 도움이 필요하세요?</h1>
                <p className="step-description">
                  관심 있는 내용을 골라 주세요. 나중에 바꿀 수 있어요.
                </p>
                <div className="choice-list">
                  {helpTopics.map((topic) => {
                    const selected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={`choice-card${selected ? " is-selected" : ""}`}
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        type="button"
                      >
                        <span className="choice-mark" aria-hidden="true">
                          {topic.mark}
                        </span>
                        <span className="choice-copy">
                          <strong>{topic.title}</strong>
                          <span>{topic.description}</span>
                        </span>
                        <span className="choice-check" aria-hidden="true">
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedTopics.includes("other") && (
                  <label className="field-label" htmlFor="other-topic">
                    필요한 내용을 적어 주세요
                    <input
                      autoComplete="off"
                      className="text-input"
                      id="other-topic"
                      maxLength={100}
                      onChange={(event) => setOtherTopic(event.target.value)}
                      placeholder="예: 병원 예약하는 방법"
                      value={otherTopic}
                    />
                  </label>
                )}
                <p className="helper-text">
                  공식 자료를 확인할 수 있는 내용부터 안내해 드려요.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <p className="eyebrow">3단계 · 편한 답을 골라 주세요</p>
                <h1 id="step-title">디지털 기기가 얼마나 익숙하세요?</h1>
                <p className="step-description">
                  정답은 없어요. 설명의 속도를 맞추는 데 참고할게요.
                </p>
                <div className="choice-list">
                  {familiarityOptions.map((option) => {
                    const selected = familiarity === option.id;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`choice-card${selected ? " is-selected" : ""}`}
                        key={option.id}
                        onClick={() => setFamiliarity(option.id)}
                        type="button"
                      >
                        <span
                          className={`radio-mark${selected ? " is-checked" : ""}`}
                          aria-hidden="true"
                        />
                        <span className="choice-copy">
                          <strong>{option.title}</strong>
                          <span>{option.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="eyebrow">4단계 · 안부 설정</p>
                <h1 id="step-title">언제 안부를 나누면 좋을까요?</h1>
                <p className="step-description">
                  기본은 일주일에 두 번이에요. 원하시면 세 번으로 바꿀 수
                  있어요.
                </p>

                <fieldset className="setting-group">
                  <legend>안부를 받을 횟수</legend>
                  <div className="segmented-options">
                    {checkInFrequencies.map((frequency) => (
                      <button
                        aria-pressed={checkInFrequency === frequency}
                        className={`segment-button${checkInFrequency === frequency ? " is-selected" : ""}`}
                        key={frequency}
                        onClick={() => setCheckInFrequency(frequency)}
                        type="button"
                      >
                        주 {frequency}회
                        {frequency === 2 && (
                          <span className="default-tag">기본</span>
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="setting-group">
                  <legend>편한 시간대</legend>
                  <div className="time-options">
                    {checkInTimes.map((time) => (
                      <button
                        aria-pressed={checkInTime === time}
                        className={`time-button${checkInTime === time ? " is-selected" : ""}`}
                        key={time}
                        onClick={() => setCheckInTime(time)}
                        type="button"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="permission-card">
                  <div className="permission-heading">
                    <span aria-hidden="true" className="permission-icon">
                      ♡
                    </span>
                    <div>
                      <strong>브라우저 알림을 켜 주세요</strong>
                      <p>
                        허용하면 정기 안부 알림을 받을 수 있어요. 허용하지
                        않으면 안부 알림은 제공되지 않아요.
                      </p>
                    </div>
                  </div>
                  <button
                    className="button button-secondary permission-button"
                    disabled={
                      permissionState === "requesting" ||
                      permissionState === "granted" ||
                      permissionState === "denied" ||
                      permissionState === "unsupported" ||
                      permissionState === "insecure"
                    }
                    onClick={requestNotificationPermission}
                    type="button"
                  >
                    {permissionState === "requesting"
                      ? "확인 중..."
                      : permissionState === "granted"
                        ? "알림 허용됨"
                        : permissionState === "denied"
                          ? "브라우저 설정에서 변경"
                          : permissionState === "unsupported"
                            ? "이 브라우저는 미지원"
                            : permissionState === "insecure"
                              ? "안전한 연결 필요"
                              : permissionState === "error" ||
                                  permissionState === "default"
                                ? "알림 권한 다시 요청하기"
                                : "알림 권한 요청하기"}
                  </button>
                  <p aria-live="polite" className="permission-status">
                    {permissionMessage}
                  </p>
                  <p className="permission-demo-note">
                    이 데모는 권한만 확인하며 실제 알림을 보내지 않아요.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="step-actions">
            {step > 0 ? (
              <button
                className="button button-back"
                onClick={goBack}
                type="button"
              >
                이전
              </button>
            ) : (
              <button
                className="button button-back"
                onClick={() => setScreen("welcome")}
                type="button"
              >
                처음으로
              </button>
            )}
            <button
              className="button button-primary button-continue"
              disabled={step === 0 && !consentAccepted}
              onClick={continueOnboarding}
              type="button"
            >
              {step === steps.length - 1 ? "로그인으로" : "다음"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "consent-blocked" && (
        <section aria-labelledby="blocked-title" className="message-panel">
          <span aria-hidden="true" className="message-icon">
            !
          </span>
          <p className="eyebrow">동의가 필요해요</p>
          <h1 id="blocked-title">동의하지 않으면 서비스를 이용할 수 없어요</h1>
          <p className="step-description">
            맞춤 정보 처리 동의는 이 체험 서비스 이용에 필요한 필수 항목이에요.
            내용을 다시 확인하고 계속할 수 있어요.
          </p>
          <button
            className="button button-primary button-large"
            onClick={() => {
              setConsentAccepted(false);
              setStep(0);
              setScreen("onboarding");
            }}
            type="button"
          >
            동의 안내 다시 보기
          </button>
          <button
            className="decline-link"
            onClick={resetPrototype}
            type="button"
          >
            처음 화면으로 돌아가기
          </button>
        </section>
      )}

      {screen === "login" && (
        <section aria-labelledby="login-title" className="message-panel login-panel">
          <div aria-hidden="true" className="google-mark">
            G
          </div>
          <p className="eyebrow">거의 다 왔어요</p>
          <h1 id="login-title">Google 계정으로 로그인해 주세요</h1>
          <p className="step-description">
            로그인해야 청아의 안내 서비스를 이용할 수 있어요. 로그인은
            맞춤화 동의와 별도로 진행돼요.
          </p>
          <button
            className="button google-button"
            onClick={() => {
              setLoginNotice(false);
              setScreen("home");
            }}
            type="button"
          >
            <span aria-hidden="true" className="google-button-mark">
              G
            </span>
            Google 로그인 시연하기
          </button>
          <p className="demo-note login-demo-note">
            실제 Google 로그인이 아닌 화면 시연입니다.
          </p>
          {loginNotice && (
            <p aria-live="polite" className="inline-notice">
              로그인이 취소되었어요. 서비스를 이용하려면 이 화면에서 다시
              로그인해 주세요.
            </p>
          )}
          <button
            className="decline-link"
            onClick={() => setLoginNotice(true)}
            type="button"
          >
            로그인하지 않고 돌아가기
          </button>
        </section>
      )}

      {screen === "home" && (
        <section aria-labelledby="home-title" className="home-screen">
          <div className="home-heading">
            <div>
              <p className="eyebrow">청아와 함께하는 디지털 생활</p>
              <h1 id="home-title">안녕하세요. 무엇을 도와드릴까요?</h1>
              <p className="home-subtitle">
                궁금한 내용을 고르거나 편하게 적어 주세요.
              </p>
            </div>
            <span className="account-mark" aria-label="로그인됨">
              <span aria-hidden="true">✓</span>
            </span>
          </div>

          <div className="service-status" role="status">
            <span className="status-dot" aria-hidden="true" />
            <span>
              <strong>체험 화면</strong>
              <span>실제 안내와 정보 저장은 아직 연결되지 않았어요.</span>
            </span>
          </div>

          <section aria-labelledby="topics-title" className="topic-shortcuts">
            <div className="section-heading">
              <div>
                <p className="eyebrow">바로가기</p>
                <h2 id="topics-title">
                  {selectedTopics.length > 0
                    ? "고르신 주제를 바로 열어 보세요"
                    : "어떤 도움이 필요하세요?"}
                </h2>
              </div>
              <span className="section-caption">누르면 대화로 이동해요</span>
            </div>
            <div className="topic-shortcut-list">
              {topicShortcuts.map((item) => (
                <button
                  className="topic-shortcut"
                  key={item.id}
                  onClick={() => openTopic(item.question)}
                  type="button"
                >
                  <span className="topic-shortcut-mark" aria-hidden="true">
                    {item.mark}
                  </span>
                  <span className="topic-shortcut-copy">
                    <strong>{item.title}</strong>
                    <span>사용 방법 알아보기</span>
                  </span>
                  <span className="topic-shortcut-arrow" aria-hidden="true">
                    질문하기 <span>→</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="conversation-title"
            className="conversation-card"
            ref={conversationRef}
          >
            <div className="conversation-heading">
              <CheongaMark className="assistant-avatar" />
              <div>
                <h2 id="conversation-title">청아에게 물어보기</h2>
                <p>쉬운 말로 하나씩 도와드릴게요.</p>
              </div>
            </div>
            <div aria-live="polite" className="conversation-messages">
              <div className="chat-bubble assistant-bubble">
                안녕하세요! 궁금한 내용을 말씀해 주세요. 어려운 용어도
                쉽게 풀어서 설명해 드릴게요.
              </div>
              {chatMessages.map((message) => (
                <div
                  className={`chat-bubble ${message.sender === "user" ? "user-bubble" : "assistant-bubble"}`}
                  key={message.id}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <form
              className="question-form"
              onSubmit={(event) => {
                event.preventDefault();
                sendQuestion(question);
              }}
            >
              <label className="sr-only" htmlFor="question-input">
                궁금한 내용을 입력해 주세요
              </label>
              <input
                autoComplete="off"
                id="question-input"
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="예: 복지 서비스를 신청하고 싶어요"
                value={question}
              />
              <button
                aria-label="질문 보내기"
                className="send-question-button"
                disabled={!question.trim()}
                type="submit"
              >
                보내기 <span aria-hidden="true">→</span>
              </button>
            </form>
            <p className="conversation-footnote">
              공식 자료가 확인되지 않으면 안내를 만들어 답하지 않아요.
            </p>
          </section>

          <section aria-label="정기 안부 설정" className="checkin-summary">
            <span aria-hidden="true" className="checkin-icon">
              ♡
            </span>
            <span className="checkin-copy">
              <strong>정기 안부</strong>
              <span>
                주 {checkInFrequency}회
                {checkInTime ? ` · ${checkInTime}` : ""} · 알림{" "}
                {permissionSummary[permissionState]}
              </span>
            </span>
            <span aria-hidden="true" className="checkin-arrow">
              →
            </span>
          </section>

          <p className="home-demo-note">
            이 화면은 시연용입니다. 대화는 저장·전송되지 않으며 실제 알림도
            보내지 않아요.
          </p>
        </section>
      )}

      <footer className="page-footer">
        <span>청아</span>
        <span>쉬운 디지털 안내와 안부</span>
      </footer>
    </main>
  );
}
