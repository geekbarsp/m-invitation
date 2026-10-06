"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AnimationItem } from "lottie-web";
import { ArrowDown, ArrowUpRight, Check, Heart, MapPin, Music2, Pause, Play, Repeat2, SkipBack, SkipForward, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { invitation } from "../src/data/invitation";
import PrenupGallery from "./PrenupGallery";

type Countdown = { days: string; hours: string; minutes: string; seconds: string };
const emptyCountdown: Countdown = { days: "—", hours: "—", minutes: "—", seconds: "—" };
const invitePetals = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 101,
  delay: -((index * 0.43) % 7.2),
  duration: 6.4 + (index % 7) * 0.48,
}));
const ambientPetals = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: (index * 47 + 7) % 100,
  delay: -((index * 1.13) % 12),
  duration: 11 + (index % 5) * 1.8,
}));

type NamePair = readonly [string, string];

function PeoplePairs({ pairs }: { pairs: readonly NamePair[] }) {
  return <div className="people-pairs">{pairs.map(([first, second]) => <p key={`${first}-${second}`}><span>{first}</span><i>&amp;</i><span>{second}</span></p>)}</div>;
}

function ChildrenAndBearers() {
  const { weddingParty } = invitation;
  return <div className="children-party">
    <div><b>Flower Girls</b><ol>{weddingParty.flowerGirls.map((name) => <li key={name}>{name}</li>)}</ol></div>
    <p><b>Little Bride &amp; Groom</b>{weddingParty.littleBrideAndGroom.join(" & ")}</p>
    <p><b>Ring Bearer</b>{weddingParty.ringBearer}</p>
    <p><b>Coin Bearers</b>{weddingParty.coinBearers.join(" & ")}</p>
    <p><b>Bible Bearer</b>{weddingParty.bibleBearer}</p>
  </div>;
}

export default function InvitationExperience() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLButtonElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLSpanElement>(null);
  const innerCard = useRef<HTMLDivElement>(null);
  const stationery = useRef<HTMLDivElement>(null);
  const introDetails = useRef<HTMLDivElement>(null);
  const detailsPopup = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const transitionLayer = useRef<HTMLDivElement>(null);
  const paperPlaneContainer = useRef<HTMLDivElement>(null);
  const loveTransitionContainer = useRef<HTMLDivElement>(null);
  const paperPlaneLottie = useRef<AnimationItem | null>(null);
  const loveTransitionLottie = useRef<AnimationItem | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const [showInvitePetals, setShowInvitePetals] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(emptyCountdown);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("invitation-locked");
    const lenis = new Lenis({ duration: reduced ? 0 : 1.05, smoothWheel: !reduced, prevent: (node) => Boolean(node.closest(".details-popup")) });
    lenisRef.current = lenis;
    lenis.stop();
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from(envelope.current, { scale: 0.9, y: 28, opacity: 0, duration: 1.4, ease: "power3.out" });
        gsap.from(".intro-flower", { y: 22, opacity: 0, rotation: -3, duration: 1.5, stagger: 0.16, ease: "power3.out" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, { y: 42, opacity: 0, duration: 1.05, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%" } });
        });
        gsap.utils.toArray<HTMLElement>(".stack-card").forEach((card, index) => {
          if (!index) return;
          gsap.fromTo(card, { yPercent: 110, rotate: index % 2 ? 2 : -2 }, { yPercent: 0, rotate: 0, ease: "none", scrollTrigger: { trigger: ".card-journey", start: `${index * 24}% top`, end: `${index * 24 + 34}% top`, scrub: 0.8 } });
        });
        gsap.to(".story-photo", { yPercent: -8, scale: 1.035, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom top", scrub: 1 } });
        gsap.to(".hero-image img", { yPercent: 9, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsap.to(".scroll-progress span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 0.25 } });
        gsap.utils.toArray<HTMLElement>(".glass-lift").forEach((card) => {
          gsap.from(card, { y: 55, opacity: 0, filter: "blur(10px)", duration: 1.15, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%" } });
        });
      }
    }, root);
    const trackPointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => { document.documentElement.classList.remove("invitation-locked"); window.removeEventListener("pointermove", trackPointer); ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); gsap.ticker.remove(update); lenis.destroy(); lenisRef.current = null; };
  }, []);

  useEffect(() => {
    let disposed = false;
    const loadTransition = async () => {
      const [{ default: lottie }, paperResponse, loveResponse] = await Promise.all([
        import("lottie-web"),
        fetch("/animations/paper-plane-heart.json"),
        fetch("/animations/fullscreen-love-transition.json"),
      ]);
      if (!paperResponse.ok || !loveResponse.ok) throw new Error("Unable to load the site transition animations.");
      const [paperData, loveData] = await Promise.all([paperResponse.json(), loveResponse.json()]);
      if (disposed || !paperPlaneContainer.current || !loveTransitionContainer.current) return;
      paperPlaneLottie.current = lottie.loadAnimation({
        container: paperPlaneContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: paperData,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      loveTransitionLottie.current = lottie.loadAnimation({
        container: loveTransitionContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: loveData,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      });
    };
    void loadTransition().catch(() => { paperPlaneLottie.current = null; loveTransitionLottie.current = null; });
    return () => {
      disposed = true;
      paperPlaneLottie.current?.destroy();
      loveTransitionLottie.current?.destroy();
      paperPlaneLottie.current = null;
      loveTransitionLottie.current = null;
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const distance = Math.max(0, new Date(invitation.dateISO).getTime() - Date.now());
      const day = 86_400_000;
      setCountdown({ days: String(Math.floor(distance / day)).padStart(2, "0"), hours: String(Math.floor((distance % day) / 3_600_000)).padStart(2, "0"), minutes: String(Math.floor((distance % 3_600_000) / 60_000)).padStart(2, "0"), seconds: String(Math.floor((distance % 60_000) / 1000)).padStart(2, "0") });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const openInvitation = () => {
    if (opened) return;
    setOpened(true);
    if (audio.current) void audio.current.play().then(() => { setMusic(true); setShowInvitePetals(true); }).catch(() => { setMusic(false); setShowInvitePetals(false); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([envelope.current, stationery.current, introDetails.current], { autoAlpha: 0 });
      gsap.set(detailsPopup.current, { autoAlpha: 1, pointerEvents: "auto" });
      return;
    }
    const compact = window.matchMedia("(max-width: 800px)").matches;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".intro-heading, .open-hint", { opacity: 0, duration: 0.3 }, 0)
      .to(seal.current, { scale: 0.82, opacity: 0, duration: 0.36 }, 0)
      .to(flap.current, compact
        ? { scaleY: -1, duration: 0.78, ease: "power2.inOut" }
        : { rotateX: -176, duration: 0.95, ease: "power2.inOut" }, 0.18)
      .set(innerCard.current, { autoAlpha: 1, zIndex: 1, z: 0, force3D: false }, 0.18)
      .set(flap.current, { zIndex: 0 })
      .set(innerCard.current, { zIndex: 10, z: compact ? 0 : 36, force3D: !compact })
      .to(innerCard.current, { yPercent: compact ? -70 : -76, scale: compact ? 0.96 : 1.04, duration: 1.15 }, "-=.05")
      .to(envelope.current, { y: 58, scale: 0.96, duration: 0.75 }, "-=.35")
      .to(envelope.current, { xPercent: 0, y: compact ? -118 : -82, scale: compact ? 0.7 : 0.72, duration: 1.05, ease: "power3.inOut" }, "+=2")
      .to(envelope.current, { autoAlpha: 0, y: compact ? -138 : -104, duration: 0.55 }, "-=.2")
      .to(".intro-flower", { opacity: 0.08, scale: 0.88, duration: 0.8 }, "-=1")
      .fromTo(stationery.current, { autoAlpha: 0, y: 34, scale: 0.93 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.25)" }, "-=.62")
      .fromTo(".stationery-piece", { y: 24, opacity: 0, rotate: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 }, "-=.72")
      .fromTo(".stationery-copy", { y: 8, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.55 }, "-=.48")
      .fromTo(introDetails.current, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.85 }, "-=.45")
      .to([stationery.current, introDetails.current], { autoAlpha: 0, y: -24, duration: 0.65 }, "+=3")
      .set(detailsPopup.current, { autoAlpha: 1, pointerEvents: "auto" })
      .fromTo(".details-paper-shell", { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85 });
  };

  const enterSite = () => {
    if (transitioning) return;
    setTransitioning(true);
    setShowInvitePetals(false);
    const layer = transitionLayer.current;
    const paperStage = paperPlaneContainer.current;
    const loveStage = loveTransitionContainer.current;
    const paperAnimation = paperPlaneLottie.current;
    const loveAnimation = loveTransitionLottie.current;

    const revealSite = () => {
      document.documentElement.classList.remove("invitation-locked");
      window.scrollTo({ top: 0, behavior: "auto" });
      lenisRef.current?.start();
      window.requestAnimationFrame(() => lenisRef.current?.resize());
      gsap.set(intro.current, { yPercent: -104, autoAlpha: 0, pointerEvents: "none" });
      gsap.fromTo(".hero-copy > *", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" });
      gsap.to(layer, { autoAlpha: 0, duration: 0.58, ease: "power2.out", onComplete: () => { gsap.set(layer, { pointerEvents: "none" }); setTransitioning(false); } });
    };

    if (!layer) { revealSite(); return; }
    gsap.set(layer, { autoAlpha: 1, pointerEvents: "auto", clipPath: "none", backgroundColor: "transparent" });
    gsap.set([paperStage, loveStage], { autoAlpha: 0 });

    const playFallback = () => {
      gsap.fromTo(layer, { clipPath: "circle(0% at 50% 50%)", backgroundColor: "#66733f" }, { clipPath: "circle(150% at 50% 50%)", duration: 0.72, ease: "power3.inOut", onComplete: revealSite });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { playFallback(); return; }

    const playLoveTransition = () => {
      gsap.set(paperStage, { autoAlpha: 0 });
      if (!loveAnimation || !loveStage) { playFallback(); return; }
      gsap.set(layer, { backgroundColor: "#f7f3ea" });
      gsap.set(loveStage, { autoAlpha: 1 });
      const onLoveComplete = () => {
        loveAnimation.removeEventListener("complete", onLoveComplete);
        revealSite();
      };
      loveAnimation.addEventListener("complete", onLoveComplete);
      loveAnimation.goToAndStop(0, true);
      loveAnimation.play();
    };

    if (!paperAnimation || !paperStage) { playLoveTransition(); return; }
    gsap.set(paperStage, { autoAlpha: 1 });
    const onPaperComplete = () => {
      paperAnimation.removeEventListener("complete", onPaperComplete);
      playLoveTransition();
    };
    paperAnimation.addEventListener("complete", onPaperComplete);
    paperAnimation.goToAndStop(0, true);
    paperAnimation.play();
  };

  const toggleMusic = () => {
    if (!audio.current) return;
    if (audio.current.paused) void audio.current.play().then(() => {
      setMusic(true);
      if (document.documentElement.classList.contains("invitation-locked")) setShowInvitePetals(true);
    }).catch(() => { setMusic(false); setShowInvitePetals(false); });
    else { audio.current.pause(); setMusic(false); setShowInvitePetals(false); }
  };

  const seekMusic = (seconds: number) => {
    if (!audio.current) return;
    audio.current.currentTime = Math.max(0, Math.min(audio.current.duration || Infinity, audio.current.currentTime + seconds));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!String(data.get("name") || "").trim() || !data.get("attendance")) { setError("Please share your name and attendance choice."); return; }
    setError(""); setSubmitted(true);
  };

  return (
    <div ref={root} className={`site-shell ${opened ? "is-open" : ""}`}>
      <div className="grain" aria-hidden="true" />
      <div ref={intro} className="invitation-intro">
        {showInvitePetals && <div className="invite-petal-rain" aria-hidden="true">
          {invitePetals.map((petal) => <span key={petal.id} style={{ left: `${petal.left}%`, animationDelay: `${petal.delay}s`, animationDuration: `${petal.duration}s` }} />)}
        </div>}
        <div className="intro-frame" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="intro-heading"><span>A celebration of love</span><p className="intro-eyebrow">You’re invited</p><small>Mardy &amp; Mayumi · 15.11.26</small></div>
        <div className="envelope-breathe">
          <button ref={envelope} className="envelope" onClick={openInvitation} aria-label="Open the wedding invitation">
            <div className="envelope-shadow" /><div className="envelope-back" />
            <div ref={innerCard} className="envelope-card"><span className="card-kicker">Together with their families</span><span className="monogram">{invitation.groom[0]}<span>&amp;</span>{invitation.bride[0]}</span><strong>{invitation.groom} &amp; {invitation.bride}</strong><i>request the pleasure of your company</i><small>{invitation.date}</small></div>
            <div className="envelope-front" /><div className="fold fold-left" /><div className="fold fold-right" /><div className="fold fold-bottom" /><div className="envelope-border" /><div ref={flap} className="envelope-flap" /><span ref={seal} className="wax-seal"><span>{invitation.groom[0]}<i>&amp;</i>{invitation.bride[0]}</span></span>
          </button>
        </div>
        <Image className="intro-flower intro-flower-left" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" loading="eager" />
        <Image className="intro-flower intro-flower-right" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" loading="eager" />
        <div ref={stationery} className="stationery-collage" aria-hidden="true">
          <div className="stationery-breathe">
          <Image
            className="stationery-piece canva-stationery"
            src="/assets/stationery-clean-v2.png"
            width={1025}
            height={1535}
            alt="Blue and ivory wedding stationery suite for Mardy and Mayumi"
            loading="eager"
          />
          <div className="stationery-copy stationery-monogram">M<span>&amp;</span>M</div>
          <div className="stationery-copy stationery-save-copy">
            <span>In you,</span><strong>I found my<br />forever.</strong>
          </div>
          <div className="stationery-copy stationery-invite-copy">
            <p>We</p>
            <strong>Mardy <i>&amp;</i><br />Mayumi</strong>
            <small>Cordially invite you to our<br />wedding celebration</small>
            <b>{invitation.date}<br />Sunday · {invitation.ceremonyTime}<br />{invitation.venue}<br />{invitation.location}</b>
          </div>
          </div>
        </div>
        <div ref={introDetails} className="intro-details">
          <p className="intro-details-kicker">Day left before we say “I do”</p>
          <div className="intro-countdown" aria-label="Wedding countdown">
            {Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
          <span className="intro-details-rule" />
          <p className="intro-details-note">Excited to celebrate our day with you</p>
          <strong className="intro-details-names">{invitation.groom} &amp; {invitation.bride}</strong>
          <small>{invitation.date}</small>
        </div>
        <button className="open-hint" onClick={openInvitation}>Click to open <ArrowDown size={14} /></button>
        <div ref={detailsPopup} className="details-popup" role="dialog" aria-modal="true" aria-label="Scrollable wedding invitation details" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
          <article className="details-paper-shell">
            <section className="popup-welcome">
              <div>
                <p className="popup-script-title">Welcome</p>
                <p>With joyful hearts, we welcome you to celebrate our wedding as we begin our life together in love and faith. Your presence is a blessing on our special day.</p>
                <strong>{invitation.groom} &amp; {invitation.bride}</strong>
                <div className="popup-music-box">
                  <span className={`popup-album-mark ${music ? "is-playing" : ""}`}>
                    <Image src="/musicicon.webp" width={56} height={56} alt="A Thousand Years album artwork" />
                  </span>
                  <div className="popup-track"><small>Our song</small><strong>A Thousand Years</strong><i>Christina Perri</i></div>
                  <div className="popup-player-controls">
                    <button onClick={() => seekMusic(-10)} aria-label="Rewind ten seconds"><SkipBack size={14} /></button>
                    <button className="popup-play" onClick={toggleMusic} aria-label={music ? "Pause music" : "Play music"}>{music ? <Pause size={15} /> : <Play size={15} />}</button>
                    <button onClick={() => seekMusic(10)} aria-label="Forward ten seconds"><SkipForward size={14} /></button>
                    <span title="Music repeats"><Repeat2 size={13} /></span>
                  </div>
                </div>
              </div>
              <div className="popup-envelope-asset">
                <div className="popup-envelope-sheet">
                  <Image className="popup-envelope-image" src="/assets/stationery-clean-v2.png" width={1025} height={1535} sizes="(max-width: 800px) 55vw, 460px" alt="Ivory and blue wedding stationery with flowers" priority />
                  <div className="popup-stationery-copy popup-stationery-monogram">M<span>&amp;</span>M</div>
                  <div className="popup-stationery-copy popup-stationery-quote"><span>In you,</span><strong>I found my<br />forever.</strong></div>
                  <div className="popup-stationery-copy popup-stationery-invite">
                    <p>We</p><strong>Mardy <i>&amp;</i><br />Mayumi</strong>
                    <small>Cordially invite you to our<br />wedding celebration</small>
                    <b>{invitation.date}<br />{invitation.ceremonyTime}<br />{invitation.location}</b>
                  </div>
                </div>
              </div>
            </section>

            <section className="popup-save-date">
              <div className="popup-save-lockup"><div className="popup-save-first-line"><span>Save</span><small>the</small></div><span>Date</span><b>{invitation.groom[0]} &amp; {invitation.bride[0]}</b><i>{invitation.date}</i></div>
              <div className="popup-countdown-wrap"><p>Day left before we say <em>“I do”</em></p><div className="popup-countdown">{Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><small>{invitation.ceremonyTime} · {invitation.venue}<br />{invitation.location}</small></div>
            </section>

            <PrenupGallery compact />

            <section className="popup-section popup-entourage">
              <p className="popup-kicker">Together with our families</p><h2>The <em>Entourage</em></h2>
              <div className="entourage-family"><p><b>Parents of the Bride</b>{invitation.parents.bride.join(" & ")}</p><p><b>Parents of the Groom</b>{invitation.parents.groom.join(" & ")}</p></div>
              <h3>Principal Sponsors</h3><PeoplePairs pairs={invitation.principalSponsors} />
              <h3>Secondary Sponsors</h3><PeoplePairs pairs={invitation.secondarySponsors} />
              <div className="wedding-party"><p><b>Best Man</b>{invitation.weddingParty.bestMan}</p><p><b>Bridesmaid</b>{invitation.weddingParty.bridesmaid}</p></div>
              <ChildrenAndBearers />
            </section>

            <section className="popup-section popup-attire">
              <p className="popup-kicker">Celebrate in style</p><h2>Attire <em>Guide</em></h2>
              <div className="attire-grid">
                <article><div className="attire-art-wrap"><Image className="attire-art" src="/assets/attire/principal-sponsors-blue-v2.png" width={1024} height={1536} alt="Principal sponsors wearing formal attire from the blue wedding palette" /></div><h3>Principal Sponsors</h3><p>Any color from the blue palette</p><div className="mini-swatches"><i /><i /><i /></div></article>
                <article><div className="attire-art-wrap"><Image className="attire-art" src="/assets/attire/guests-blue-v2.png" width={1536} height={1024} alt="Wedding guests wearing formal attire from the blue wedding palette" /></div><h3>Guests</h3><p>Any color from the blue palette</p><div className="mini-swatches beige"><i /><i /><i /></div></article>
                <article><div className="attire-art-wrap"><Image className="attire-art" src="/assets/attire/secondary-sponsors-blue-v2.png" width={1536} height={1024} alt="Secondary sponsors wearing formal attire from the blue wedding palette" /></div><h3>Secondary Sponsors</h3><p>Any color from the blue palette</p><div className="mini-swatches olive"><i /><i /><i /></div></article>
                <article><div className="attire-art-wrap"><Image className="attire-art" src="/assets/attire/children-blue-v2.png" width={1536} height={1024} alt="Flower girls and bearers wearing formal attire from the blue wedding palette" /></div><h3>Flower Girls &amp; Bearers</h3><p>Any color from the blue palette</p><div className="mini-swatches light"><i /><i /><i /></div></article>
              </div>
            </section>

            <section className="popup-section popup-venue">
              <p className="popup-kicker">Where we’ll celebrate</p><h2>The <em>Venue</em></h2>
              <div className="popup-venue-photo"><Image src="/assets/photos/glass-garden.webp" fill sizes="(max-width: 800px) 92vw, 900px" alt="Romantic garden ceremony venue" /><span className="venue-image-veil" aria-hidden="true" /><span className="popup-venue-caption">A garden made for forever</span></div>
              <div className="popup-venue-details"><MapPin size={17} /><p><strong>{invitation.venue}</strong>{invitation.location}<br />Sunday, {invitation.date} · {invitation.ceremonyTime}</p></div>
              <div className="popup-venue-links"><a href={invitation.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRight size={14} /></a></div>
            </section>

            <section className="popup-section popup-gifts">
              <Image className="popup-flower popup-flower-bottom" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" />
              <p className="popup-kicker">With gratitude</p><h2>Gift <em>Registry</em></h2><p>We are truly blessed to have you with us as we celebrate our love. Your presence is more than enough, but if you wish to give a gift, a monetary contribution would greatly help as we build the foundation for our future together.</p>
              <button className="visit-site-button" onClick={enterSite} disabled={transitioning}>Visit site for more info <ArrowDown size={16} /></button>
            </section>
          </article>
        </div>
      </div>
      <div ref={transitionLayer} className="site-transition" aria-hidden="true">
        <div ref={paperPlaneContainer} className="site-transition-stage site-transition-paper" />
        <div ref={loveTransitionContainer} className="site-transition-stage site-transition-love" />
      </div>
      <main>
        <div className="scroll-progress" aria-hidden="true"><span /></div>
        <nav className="glass-nav" aria-label="Wedding invitation navigation">
          <a className="nav-monogram" href="#top" aria-label="Back to the beginning">M<span>&amp;</span>M</a>
          <div className="nav-links">
            <a href="#top">Home</a>
            <a href="#details">Details</a>
            <a href="#venue">Venue</a>
            <a href="#attire">Attire</a>
            <a href="#photos">Photos</a>
            <a href="#gifts">Gifts</a>
          </div>
          <a className="nav-rsvp" href="#rsvp">RSVP <ArrowUpRight size={13} /></a>
        </nav>
        <div className="ambient-petals" aria-hidden="true">
          {ambientPetals.map((petal) => <i key={petal.id} style={{ left: `${petal.left}%`, animationDelay: `${petal.delay}s`, animationDuration: `${petal.duration}s` }} />)}
        </div>
        <section id="top" className="hero" aria-labelledby="hero-title"><div className="hero-image"><Image src="/assets/prenup/RAPH3754.jpg" fill sizes="100vw" loading="eager" style={{ objectPosition: "62% center" }} alt="Mardy and Mayumi embracing on a garden bridge during their prenup session" /></div><div className="hero-shade" />
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" /><div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-copy hero-glass"><span className="hero-heart" aria-hidden="true"><Heart size={14} /></span><p className="eyebrow">Together with their families</p><h1 id="hero-title"><span className="hero-name"><b>{invitation.groom.split(" ")[0]}</b><small>{invitation.groom.split(" ").slice(1).join(" ")}</small></span><i>&amp;</i><span className="hero-name"><b>{invitation.bride.split(" ")[0]}</b><small>{invitation.bride.split(" ").slice(1).join(" ")}</small></span></h1><div className="hero-rule" /><p>{invitation.date} · {invitation.location}</p><a href="#welcome" className="explore">Enter our story <ArrowDown size={15} /></a></div>
        </section>
        <section id="welcome" className="welcome paper-section"><Image className="side-flower" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" /><div data-reveal className="welcome-copy"><p className="eyebrow olive">A joyful beginning</p><h2>Welcome</h2><p>With joyful hearts, we invite you to celebrate our wedding as we begin our life together in love and faith.</p><span className="signature">{invitation.groom[0]} &amp; {invitation.bride[0]}</span></div><div data-reveal className="save-date-card glass-lift"><small>Save the date</small><strong>15</strong><span>November · 2026</span></div></section>
        <section className="card-journey" aria-label="Wedding invitation details"><div className="stack-wrap">
          <article className="stack-card stack-intro"><p className="eyebrow">Our wedding day</p><h2>The Entourage</h2><div className="names-columns"><p>Parents of the bride<br/><b>{invitation.parents.bride.join(" & ")}</b></p><p>Parents of the groom<br/><b>{invitation.parents.groom.join(" & ")}</b></p></div><p className="tiny-copy">With the love of our families and the blessing of those dearest to us.</p></article>
          <article className="stack-card stack-date"><p className="eyebrow">Sunday</p><div className="date-lockup"><span>NOV</span><strong>15</strong><span>2026</span></div><p>Three o’clock in the afternoon</p><div className="ornament">❦</div></article>
          <article className="stack-card stack-details"><p className="eyebrow">{invitation.weddingType}</p><h2>Details</h2><div className="mini-event"><span>Ceremony</span><strong>{invitation.ceremonyTime}</strong><p>{invitation.venue}</p></div><div className="mini-event"><span>Reception</span><strong>{invitation.receptionTime}</strong><p>{invitation.receptionVenue}</p></div></article>
        </div></section>
        <section className="main-entourage paper-section">
          <div data-reveal className="section-heading"><p className="eyebrow olive">The people beside us</p><h2>Our Entourage</h2><p>Family and friends chosen to stand with us as we begin this new chapter.</p></div>
          <div className="entourage-main-grid">
            <article className="entourage-panel entourage-families glass-lift"><span className="role-number">01</span><h3>Our Families</h3><div><p><b>Parents of the Bride</b>{invitation.parents.bride.join(" & ")}</p><p><b>Parents of the Groom</b>{invitation.parents.groom.join(" & ")}</p></div></article>
            <article className="entourage-panel entourage-list-panel glass-lift"><span className="role-number">02</span><h3>Principal Sponsors</h3><PeoplePairs pairs={invitation.principalSponsors} /></article>
            <article className="entourage-panel entourage-list-panel glass-lift"><span className="role-number">03</span><h3>Secondary Sponsors</h3><PeoplePairs pairs={invitation.secondarySponsors} /></article>
            <article className="entourage-panel entourage-party glass-lift"><span className="role-number">04</span><h3>Wedding Party</h3><div><p><b>Best Man</b>{invitation.weddingParty.bestMan}</p><p><b>Bridesmaid</b>{invitation.weddingParty.bridesmaid}</p></div></article>
            <article className="entourage-panel entourage-children glass-lift"><span className="role-number">05</span><h3>Flower Girls &amp; Bearers</h3><ChildrenAndBearers /></article>
          </div>
        </section>
        <section className="story editorial-section"><div data-reveal className="story-image"><Image className="story-photo" src="/assets/prenup/RAPH3625.jpg" fill sizes="(max-width: 800px) 90vw, 45vw" alt="Mardy and Mayumi posing together beside the pool during their prenup session" /></div><div data-reveal className="story-copy"><p className="eyebrow olive">Our story · 2019—forever</p><h2>All roads led<br/><em>to you.</em></h2><p>{invitation.story}</p><blockquote>“The best is yet to be.”</blockquote></div></section>
        <PrenupGallery />
        <section className="countdown-section"><p className="eyebrow">Until we say “I do”</p><h2>{invitation.date}</h2><div className="countdown" aria-label="Countdown to the wedding">{Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
        <section id="details" className="events paper-section"><div data-reveal className="section-heading"><p className="eyebrow olive">Where &amp; when</p><h2>The Details</h2></div><div className="event-grid"><article className="event-card glass-lift"><span>01</span><h3>Ceremony</h3><p className="event-time">{invitation.ceremonyTime}</p><p>{invitation.venue}<br/>{invitation.location}</p><p className="description">An intimate garden ceremony beneath the palms.</p></article><article className="event-card dark glass-lift"><span>02</span><h3>Reception</h3><p className="event-time">{invitation.receptionTime}</p><p>{invitation.receptionVenue}<br/>{invitation.location}</p><p className="description">Dinner, dancing, and a night to remember.</p></article></div></section>
        <section id="venue" className="location editorial-section">
          <div data-reveal className="location-heading"><p className="eyebrow olive">Where we’ll celebrate</p><h2>The <em>Venue</em></h2><p>A quiet garden, a beautiful promise, and all our favorite people gathered in one place.</p></div>
          <div className="location-scene">
            <div data-reveal className="location-photo"><Image src="/assets/photos/glass-garden.webp" fill sizes="(max-width: 800px) 94vw, 1100px" alt="Romantic garden ceremony venue" /><span className="venue-image-veil" aria-hidden="true" /><span className="location-photo-note">Under the palms<br /><em>we say “I do”</em></span></div>
            <div data-reveal className="location-copy"><span className="location-pin"><MapPin size={18}/></span><p className="eyebrow olive">Meet us there</p><h3>{invitation.venue}</h3><p>{invitation.location}</p><div className="location-meta"><span><small>Date</small>{invitation.date}</span><span><small>Time</small>{invitation.ceremonyTime}</span></div><a href={invitation.mapsUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={15}/></a></div>
          </div>
        </section>
        <section id="attire" className="dress paper-section"><div data-reveal className="dress-heading"><p className="eyebrow olive">Celebrate in style</p><h2>Attire Guide</h2><p>Everyone may wear any color from our five-color blue palette: Silver Lake, Powder Blue, Dusty Blue, Dutch Blue, or Provence Blue.</p><div className="swatches" aria-label="Suggested color palette">{invitation.palette.map((color, i) => <span key={color} style={{ backgroundColor: color }} title={["Silver Lake","Powder Blue","Dusty Blue","Dutch Blue","Provence Blue"][i]} />)}</div></div><div className="main-attire-grid">
          <article className="main-attire-card glass-lift"><div><Image src="/assets/attire/principal-sponsors-blue-v2.png" fill sizes="(max-width: 800px) 80vw, 24vw" alt="Principal sponsors wearing formal attire from the blue wedding palette" /></div><span>01</span><h3>Principal Sponsors</h3><p>Any color from the blue palette</p><div className="mini-swatches"><i/><i/><i/></div></article>
          <article className="main-attire-card glass-lift"><div><Image src="/assets/attire/guests-blue-v2.png" fill sizes="(max-width: 800px) 80vw, 24vw" alt="Guests wearing formal attire from the blue wedding palette" /></div><span>02</span><h3>Guests</h3><p>Any color from the blue palette</p><div className="mini-swatches beige"><i/><i/><i/></div></article>
          <article className="main-attire-card glass-lift"><div><Image src="/assets/attire/secondary-sponsors-blue-v2.png" fill sizes="(max-width: 800px) 80vw, 24vw" alt="Secondary sponsors wearing formal attire from the blue wedding palette" /></div><span>03</span><h3>Secondary Sponsors</h3><p>Any color from the blue palette</p><div className="mini-swatches olive"><i/><i/><i/></div></article>
          <article className="main-attire-card glass-lift"><div><Image src="/assets/attire/children-blue-v2.png" fill sizes="(max-width: 800px) 80vw, 24vw" alt="Flower girls and bearers wearing formal attire from the blue wedding palette" /></div><span>04</span><h3>Flower Girls &amp; Bearers</h3><p>Any color from the blue palette</p><div className="mini-swatches light"><i/><i/><i/></div></article>
        </div></section>
        <section id="gifts" className="main-gifts"><Image className="gift-flower" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" /><div data-reveal className="gift-glass"><p className="eyebrow">With gratitude</p><h2>Gift <em>Registry</em></h2><p>We are truly blessed to have you with us as we celebrate our love. Your presence is more than enough, but if you wish to give a gift, a monetary contribution would greatly help as we build the foundation for our future together.</p><span>With love, Mardy &amp; Mayumi</span></div></section>
        <section id="rsvp" className="rsvp-section"><Image className="rsvp-flower" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" /><div className="rsvp-paper" data-reveal>{submitted ? <div className="success"><span><Check size={24}/></span><p className="eyebrow olive">Thank you</p><h2>Your reply is received.</h2><p>We can’t wait to celebrate together.</p><button onClick={() => setSubmitted(false)}>Send another response</button></div> : <><p className="eyebrow olive">Kindly reply</p><h2>RSVP</h2><p>Please respond at your earliest convenience.</p><form onSubmit={handleSubmit} noValidate><label>Full name<input name="name" type="text" autoComplete="name" /></label><fieldset><legend>Will you attend?</legend><label><input type="radio" name="attendance" value="yes" /> Joyfully accepts</label><label><input type="radio" name="attendance" value="no" /> Regretfully declines</label></fieldset><label>Number of guests<select name="guests" defaultValue="1"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><label>Message <span>(optional)</span><textarea name="message" rows={3} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit">Send response <ArrowUpRight size={15}/></button></form></>}</div></section>
        <footer><span className="footer-monogram">{invitation.groom[0]}<span>&amp;</span>{invitation.bride[0]}</span><p>{invitation.date} · Zaragoza, Nueva Ecija</p><small>Made with love for a day to remember.</small></footer>
      </main>
      {/* Background music is controlled by the adjacent accessible button. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audio} src="/wedbgm.mp3" loop preload="auto" />
      <button className="music-control" onClick={toggleMusic} aria-label={music ? "Turn music off" : "Turn music on"}>{music ? <Music2 size={16}/> : <VolumeX size={16}/>}<span>{music ? "On" : "Music"}</span></button>
    </div>
  );
}
