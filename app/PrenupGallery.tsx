"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, Heart, MapPin, MoveUpRight, X } from "lucide-react";
import { prenupPhotos } from "../src/data/prenup";
import { invitation } from "../src/data/invitation";
import "./prenup-journey.css";

const stops = [
  ["Hand in hand", "The garden path", "Every little adventure begins with you."],
  ["My favorite place", "A quiet embrace", "Right here, in your arms."],
  ["Side by side", "Through the gardens", "Wherever we wander, we go together."],
  ["Just the two of us", "By the water", "An ordinary moment, a beautiful memory."],
  ["A little dance", "The lakeside lawn", "With you, the world slows down."],
  ["That familiar smile", "A moment to pause", "The smallest things mean everything."],
  ["Meet me here", "The garden bridge", "Every path brings me back to you."],
  ["On to forever", "Our next adventure", "You, me, and all the roads ahead."],
] as const;

export default function PrenupGallery({ compact = false }: { compact?: boolean }) {
  const section = useRef<HTMLElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [route, setRoute] = useState({ d: "", width: 1, height: 1 });
  const [selected, setSelected] = useState(0);
  const photo = prenupPhotos[selected];

  useEffect(() => {
    const dialog = viewer.current;
    if (!dialog) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      setSelected((index) => (index + direction + prenupPhotos.length) % prenupPhotos.length);
    };
    const handleBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("keydown", handleKey);
    dialog.addEventListener("click", handleBackdrop);
    return () => {
      dialog.removeEventListener("keydown", handleKey);
      dialog.removeEventListener("click", handleBackdrop);
    };
  }, []);

  useEffect(() => {
    const element = section.current;
    const canvas = map.current;
    if (!element || !canvas) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = canvas.getBoundingClientRect();
        const points = Array.from(canvas.querySelectorAll<HTMLElement>(".journey-pin")).map((pin) => {
          const rect = pin.getBoundingClientRect();
          return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
        });
        const narrow = window.matchMedia("(max-width: 600px)").matches;
        const d = points.map((point, index) => {
          if (!index) return `M ${point.x} ${point.y}`;
          const previous = points[index - 1];
          const middle = (previous.y + point.y) / 2;
          return narrow
            ? `C ${point.x - 22} ${middle - 45}, ${point.x + 22} ${middle + 45}, ${point.x} ${point.y}`
            : `C ${previous.x} ${middle}, ${point.x} ${middle}, ${point.x} ${point.y}`;
        }).join(" ");
        setRoute({ d, width: bounds.width, height: bounds.height });
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(canvas);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-arrived");
        element.classList.add("is-charted");
        observer.unobserve(entry.target);
      }
    }, { root: element.closest(".details-popup"), threshold: 0.12 });
    element.querySelectorAll(".journey-stop").forEach((stop) => observer.observe(stop));
    measure();
    return () => { resize.disconnect(); observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  const openPhoto = (index: number) => {
    setSelected(index);
    viewer.current?.showModal();
  };
  const changePhoto = (direction: number) => setSelected((index) => (index + direction + prenupPhotos.length) % prenupPhotos.length);

  return (
    <section ref={section} id={compact ? "popup-prenup" : "photos"}
      className={`prenup-section ${compact ? "popup-section popup-prenup" : "main-prenup paper-section"}`}
      aria-labelledby={compact ? "popup-prenup-title" : "prenup-title"}>
      <div className="journey-contours" aria-hidden="true" />
      <header className="prenup-heading">
        <span className="journey-edition">THE MARDY &amp; MAYUMI ATLAS</span>
        <div className="journey-heading-mark" aria-hidden="true"><span /><Heart size={18} /><span /></div>
        <h2 id={compact ? "popup-prenup-title" : "prenup-title"}>A map of <em>us.</em></h2>
        <p>Eight little stops. A thousand memories.<br />One beautiful journey, together.</p>
        <span className="journey-hint"><MapPin size={13} /> Follow our story · Tap a photo to linger</span>
      </header>

      <div className="journey-map" ref={map}>
        <div className="journey-compass" aria-hidden="true"><span>N</span><Compass size={58} strokeWidth={.8} /><small>you are my direction</small></div>
        <svg className="journey-route" width="100%" height="100%" viewBox={`0 0 ${route.width} ${route.height}`} aria-hidden="true">
          <path className="journey-route-base" d={route.d} />
          <path className="journey-route-ink" d={route.d} pathLength="1" />
          <path className="journey-route-stitches" d={route.d} />
        </svg>
        <ol className="journey-stops">
          {prenupPhotos.map((image, index) => (
            <li className={`journey-stop journey-stop-${index + 1}`} key={image.file}>
              <span className="journey-pin" aria-hidden="true"><Heart size={15} fill="currentColor" /></span>
              <div className="journey-arrival">
                <button className="journey-postcard" onClick={() => openPhoto(index)} aria-label={`View photo ${index + 1}: ${image.alt}`}>
                  <span className="journey-tape" aria-hidden="true" />
                  <span className="journey-photo-frame">
                    <Image src={`/assets/prenup/${image.file}.jpg`} width={image.width} height={image.height} alt={image.alt}
                      sizes={compact ? "(max-width: 600px) 75vw, 380px" : "(max-width: 600px) 76vw, (max-width: 1000px) 39vw, 470px"} loading="lazy" />
                    <span className="journey-photo-expand" aria-hidden="true"><MoveUpRight size={16} /></span>
                  </span>
                  <span className="journey-photo-caption">{stops[index][0]}</span>
                  <span className="journey-photo-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </button>
                <p className="journey-note">{stops[index][2]}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="journey-finish"><span className="journey-finish-line" /><Heart size={23} strokeWidth={1} /><span className="journey-edition">OUR NEXT DESTINATION</span><p>Forever, with you.</p><small>{invitation.date} · The beginning of always</small></div>

      <dialog ref={viewer} className="journey-viewer" aria-label="Prenup photo viewer" data-lenis-prevent>
        <div className="journey-viewer-inner">
          <button className="journey-viewer-close" onClick={() => viewer.current?.close()} aria-label="Close photo viewer"><X size={24} /></button>
          <div className="journey-viewer-photo"><Image src={`/assets/prenup/${photo.file}.jpg`} fill sizes="92vw" alt={photo.alt} /></div>
          <div className="journey-viewer-controls">
            <button onClick={() => changePhoto(-1)} aria-label="Previous photo"><ArrowLeft size={22} /></button>
            <div aria-live="polite"><p>{stops[selected][0]}</p><span>{selected + 1} / {prenupPhotos.length}</span></div>
            <button onClick={() => changePhoto(1)} aria-label="Next photo"><ArrowRight size={22} /></button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
