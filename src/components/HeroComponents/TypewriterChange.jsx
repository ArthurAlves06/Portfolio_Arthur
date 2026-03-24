import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function TypewriterChange({ className }) {
  const { t } = useTranslation();
  const phrases = t('hero.typewriterPhrases', { returnObjects: true }) || ['modern', 'performant', 'accessible', 'fun'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const mounted = useRef(true);

  // compute min width based on longest phrase
  const maxLen = Math.max(...phrases.map(p => p.length));

  useEffect(() => {
    mounted.current = true;
    let timeout;

    const current = phrases[phraseIndex];
    const baseSpeed = 80; // ms per char when typing
    const deleteSpeed = 40; // ms per char when deleting

    if (!isDeleting && display === current) {
      // pause at full word
      timeout = setTimeout(() => setIsDeleting(true), 900);
    } else if (isDeleting && display === '') {
      // move to next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, 220);
    } else {
      timeout = setTimeout(() => {
        if (!mounted.current) return;
        if (isDeleting) {
          setDisplay((d) => current.substring(0, d.length - 1));
        } else {
          setDisplay((d) => current.substring(0, d.length + 1));
        }
      }, isDeleting ? deleteSpeed : baseSpeed);
    }

    return () => {
      clearTimeout(timeout);
      mounted.current = false;
    };
  }, [display, isDeleting, phraseIndex]);

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'baseline',
        minWidth: `${maxLen}ch`,
        whiteSpace: 'nowrap'
      }}
    >
      <span className="typewriter-text">{display}</span>
    </span>
  );
}
