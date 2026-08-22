"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUpRight, Check, MapPin, Music2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { invitation } from "../src/data/invitation";

type Countdown = { days: string; hours: string; minutes: string; seconds: string };
const emptyCountdown: Countdown = { days: "—", hours: "—", minutes: "—", seconds: "—" };

export default function InvitationExperience() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLButtonElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLSpanElement>(null);
  const innerCard = useRef<HTMLDivElement>(null);
  const stationery = useRef<HTMLDivElement>(null);
  const introDetails = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(emptyCountdown);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ duration: reduced ? 0 : 1.05, smoothWheel: !reduced });
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
        gsap.to(".story-photo", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom top", scrub: 1 } });
      }
    }, root);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); gsap.ticker.remove(update); lenis.destroy(); };
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void gsap.set(intro.current, { autoAlpha: 0, pointerEvents: "none" });
    const compact = window.matchMedia("(max-width: 800px)").matches;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".intro-heading, .open-hint", { opacity: 0, duration: 0.3 }, 0)
      .to(seal.current, { scale: 0.82, opacity: 0, duration: 0.36 }, 0)
      .to(flap.current, { rotateX: -176, duration: 0.95, ease: "power2.inOut" }, 0.18)
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
      .to(intro.current, { yPercent: -104, opacity: 0, duration: 1.15, delay: 5, pointerEvents: "none" })
      .fromTo(".hero-copy > *", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 }, "-=.65");
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
      <div ref={intro} className="invitation-intro" aria-hidden={opened}>
        <div className="intro-frame" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="intro-heading"><span>A celebration of love</span><p className="intro-eyebrow">You’re invited</p><small>Mayumi &amp; Mardy · 18.12.26</small></div>
        <div className="envelope-breathe">
          <button ref={envelope} className="envelope" onClick={openInvitation} aria-label="Open the wedding invitation">
            <div className="envelope-shadow" /><div className="envelope-back" />
            <div ref={innerCard} className="envelope-card"><span className="card-kicker">Together with their families</span><span className="monogram">{invitation.bride[0]}<span>&amp;</span>{invitation.groom[0]}</span><strong>{invitation.bride} &amp; {invitation.groom}</strong><i>request the pleasure of your company</i><small>{invitation.date}</small></div>
            <div className="envelope-front" /><div className="fold fold-left" /><div className="fold fold-right" /><div className="fold fold-bottom" /><div className="envelope-border" /><div ref={flap} className="envelope-flap" /><span ref={seal} className="wax-seal"><span>{invitation.bride[0]}<i>&amp;</i>{invitation.groom[0]}</span></span>
          </button>
        </div>
        <Image className="intro-flower intro-flower-left" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" loading="eager" />
        <Image className="intro-flower intro-flower-right" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" loading="eager" />
        <div ref={stationery} className="stationery-collage" aria-hidden="true">
          <Image
            className="stationery-piece canva-stationery"
            src="/assets/stationery-clean-v2.png"
            width={1025}
            height={1535}
            alt="Olive and ivory wedding stationery suite for Mayumi and Mardy"
            loading="eager"
          />
          <div className="stationery-copy stationery-monogram">M<span>&amp;</span>M</div>
          <div className="stationery-copy stationery-save-copy">
            <span>Save</span><small>the</small><span>Date</span><i>December 18, 2026</i>
          </div>
          <div className="stationery-copy stationery-invite-copy">
            <p>We</p>
            <strong>Mayumi <i>&amp;</i><br />Mardy</strong>
            <small>Cordially invite you to our<br />wedding celebration</small>
            <b>December 18, 2026<br />Friday · {invitation.ceremonyTime}<br />{invitation.venue}<br />Pasig City, Metro Manila</b>
          </div>
          <div className="stationery-copy stationery-tag-copy"><span>details</span><strong>HERE</strong></div>
        </div>
        <div ref={introDetails} className="intro-details">
          <p className="intro-details-kicker">Day left before we say “I do”</p>
          <div className="intro-countdown" aria-label="Wedding countdown">
            {Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
          <span className="intro-details-rule" />
          <p className="intro-details-note">Excited to celebrate our day with you</p>
          <strong className="intro-details-names">{invitation.bride} &amp; {invitation.groom}</strong>
          <small>{invitation.date}</small>
        </div>
        <button className="open-hint" onClick={openInvitation}>Click to open <ArrowDown size={14} /></button>
      </div>
      <main>
        <section className="hero" aria-labelledby="hero-title"><div className="hero-image"><Image src="/assets/photos/glass-garden.webp" fill sizes="100vw" loading="eager" alt="A glass garden wedding venue at golden hour" /></div><div className="hero-shade" />
          <div className="hero-copy"><p className="eyebrow">Together with their families</p><h1 id="hero-title"><span>{invitation.bride}</span><i>&amp;</i><span>{invitation.groom}</span></h1><div className="hero-rule" /><p>{invitation.date} · {invitation.location}</p><a href="#welcome" className="explore">Enter our story <ArrowDown size={15} /></a></div>
        </section>
        <section id="welcome" className="welcome paper-section"><Image className="side-flower" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" /><div data-reveal className="welcome-copy"><p className="eyebrow olive">A joyful beginning</p><h2>Welcome</h2><p>With joyful hearts, we invite you to celebrate our wedding as we begin our life together in love and faith.</p><span className="signature">{invitation.bride[0]} &amp; {invitation.groom[0]}</span></div><div data-reveal className="save-date-card"><small>Save the date</small><strong>18</strong><span>December · 2026</span></div></section>
        <section className="card-journey" aria-label="Wedding invitation details"><div className="stack-wrap">
          <article className="stack-card stack-intro"><p className="eyebrow">Our wedding day</p><h2>The Entourage</h2><div className="names-columns"><p>Parents of the bride<br/><b>The Vergera Family</b></p><p>Parents of the groom<br/><b>The Morales Family</b></p></div><p className="tiny-copy">With the love of our families and the blessing of those dearest to us.</p></article>
          <article className="stack-card stack-date"><p className="eyebrow">Friday</p><div className="date-lockup"><span>DEC</span><strong>18</strong><span>2026</span></div><p>Three o’clock in the afternoon</p><div className="ornament">❦</div></article>
          <article className="stack-card stack-details"><p className="eyebrow">The celebration</p><h2>Details</h2><div className="mini-event"><span>Ceremony</span><strong>{invitation.ceremonyTime}</strong><p>{invitation.venue}</p></div><div className="mini-event"><span>Reception</span><strong>{invitation.receptionTime}</strong><p>{invitation.receptionVenue}</p></div></article>
        </div></section>
        <section className="story editorial-section"><div data-reveal className="story-image"><Image className="story-photo" src="/assets/photos/garden-walk.webp" fill sizes="(max-width: 800px) 90vw, 45vw" alt="A newlywed couple walking hand in hand through a garden" /></div><div data-reveal className="story-copy"><p className="eyebrow olive">Our story · 2019—forever</p><h2>All roads led<br/><em>to you.</em></h2><p>{invitation.story}</p><blockquote>“The best is yet to be.”</blockquote></div></section>
        <section className="countdown-section"><p className="eyebrow">Until we say “I do”</p><h2>{invitation.date}</h2><div className="countdown" aria-label="Countdown to the wedding">{Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
        <section className="events paper-section"><div data-reveal className="section-heading"><p className="eyebrow olive">Where &amp; when</p><h2>The Details</h2></div><div className="event-grid"><article data-reveal className="event-card"><span>01</span><h3>Ceremony</h3><p className="event-time">{invitation.ceremonyTime}</p><p>{invitation.venue}<br/>{invitation.location}</p><p className="description">An intimate garden ceremony beneath the palms.</p></article><article data-reveal className="event-card dark"><span>02</span><h3>Reception</h3><p className="event-time">{invitation.receptionTime}</p><p>{invitation.receptionVenue}<br/>{invitation.location}</p><p className="description">Dinner, dancing, and a night to remember.</p></article></div></section>
        <section className="location editorial-section"><div data-reveal className="location-photo"><Image src="/assets/photos/glass-garden.webp" fill sizes="(max-width: 800px) 100vw, 55vw" alt="The Glass Garden wedding venue" /></div><div data-reveal className="location-copy"><MapPin size={20}/><p className="eyebrow olive">Meet us there</p><h2>{invitation.venue}</h2><p>{invitation.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.address)}`} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={15}/></a></div></section>
        <section className="dress paper-section"><div data-reveal><p className="eyebrow olive">Attire</p><h2>Garden Formal</h2><p>Dress in soft, earthy hues that feel at home beneath the palms.</p></div><div className="swatches" aria-label="Suggested color palette">{invitation.palette.map((color, i) => <span key={color} style={{ backgroundColor: color }} title={["Ivory","Champagne","Sage","Dusty rose","Muted brown"][i]} />)}</div></section>
        <section id="rsvp" className="rsvp-section"><Image className="rsvp-flower" src="/assets/flowers/botanical-cascade.webp" width={1024} height={1536} alt="" /><div className="rsvp-paper" data-reveal>{submitted ? <div className="success"><span><Check size={24}/></span><p className="eyebrow olive">Thank you</p><h2>Your reply is received.</h2><p>We can’t wait to celebrate together.</p><button onClick={() => setSubmitted(false)}>Send another response</button></div> : <><p className="eyebrow olive">Kindly reply</p><h2>RSVP</h2><p>Please respond by November 18, 2026.</p><form onSubmit={handleSubmit} noValidate><label>Full name<input name="name" type="text" autoComplete="name" /></label><fieldset><legend>Will you attend?</legend><label><input type="radio" name="attendance" value="yes" /> Joyfully accepts</label><label><input type="radio" name="attendance" value="no" /> Regretfully declines</label></fieldset><label>Number of guests<select name="guests" defaultValue="1"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label><label>Message <span>(optional)</span><textarea name="message" rows={3} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit">Send response <ArrowUpRight size={15}/></button></form></>}</div></section>
        <footer><span className="footer-monogram">{invitation.bride[0]}<span>&amp;</span>{invitation.groom[0]}</span><p>{invitation.date} · Manila</p><small>Made with love for a day to remember.</small></footer>
      </main>
      <button className="music-control" onClick={() => setMusic(!music)} aria-label={music ? "Turn music off" : "Turn music on"}>{music ? <Music2 size={16}/> : <VolumeX size={16}/>}<span>{music ? "On" : "Music"}</span></button>
    </div>
  );
}
