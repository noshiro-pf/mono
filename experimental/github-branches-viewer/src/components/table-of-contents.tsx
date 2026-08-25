import {
  memo,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import './table-of-contents.css';

type TableOfContentsItem = Readonly<{
  id: string;
  label: string;
  icon: ReactNode;
}>;

const TOC_ITEMS: TableOfContentsItem[] = [
  {
    id: 'github-branches',
    icon: (
      <svg
        fill={'currentColor'}
        height={'16'}
        viewBox={'0 0 16 16'}
        width={'16'}
      >
        <path
          d={
            'M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.25 2.25 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75H8.5V4.372a2.25 2.25 0 100 0v2.128H6.25a.75.75 0 01-.75-.75V5.372A2.25 2.25 0 005 3.25z'
          }
        />
      </svg>
    ),
    label: 'Branches',
  },
  {
    id: 'readme',
    icon: (
      <svg
        fill={'currentColor'}
        height={'16'}
        viewBox={'0 0 16 16'}
        width={'16'}
      >
        <path
          d={
            'M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0114.25 16h-8.5A1.75 1.75 0 014 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H5.75z'
          }
        />
        <path
          d={
            'M6.75 5.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z'
          }
        />
      </svg>
    ),
    label: 'README',
  },
];

const CONTENTS_LABEL = 'Contents';

export const TableOfContents = memo(() => {
  const [activeSection, setActiveSection] = useState<string>(
    TOC_ITEMS[0]?.id ?? '',
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.querySelector<HTMLElement>(`#${sectionId}`);
    if (element === null) {
      return;
    }

    const headerOffset = 80;
    const offsetPosition =
      element.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({
      behavior: 'smooth',
      top: offsetPosition,
    });
  }, []);

  useEffect(() => {
    const handleScroll = (): void => {
      const sections = TOC_ITEMS.map((item) => ({
        element: document.querySelector<HTMLElement>(`#${item.id}`),
        item,
      })).filter(
        (entry): entry is { element: HTMLElement; item: TableOfContentsItem } =>
          entry.element !== null,
      );

      const scrollPosition = window.scrollY + 100;

      const currentSectionId = sections.reduce(
        (accumulator, { element, item }) =>
          element.offsetTop <= scrollPosition ? item.id : accumulator,
        TOC_ITEMS[0]?.id ?? '',
      );

      setActiveSection((previous) =>
        previous === currentSectionId ? previous : currentSectionId,
      );
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSectionClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (clickEvent) => {
      const { sectionId } = clickEvent.currentTarget.dataset;
      if (sectionId !== undefined) {
        scrollToSection(sectionId);
      }
    },
    [scrollToSection],
  );

  return (
    <nav className={'table-of-contents'}>
      <div className={'toc-header'}>
        <svg
          fill={'currentColor'}
          height={'16'}
          viewBox={'0 0 16 16'}
          width={'16'}
        >
          <path
            d={
              'M2 4a1 1 0 100-2 1 1 0 000 2zm3.75-1.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM2 9a1 1 0 100-2 1 1 0 000 2zm0 5a1 1 0 100-2 1 1 0 000 2z'
            }
          />
        </svg>
        <span>{CONTENTS_LABEL}</span>
      </div>

      <ul className={'toc-list'}>
        {TOC_ITEMS.map((item) => (
          <li key={item.id} className={'toc-item'}>
            <button
              className={`toc-link ${activeSection === item.id ? 'active' : ''}`}
              data-section-id={item.id}
              title={`Go to ${item.label}`}
              type={'button'}
              onClick={handleSectionClick}
            >
              <span className={'toc-icon'}>{item.icon}</span>
              <span className={'toc-label'}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
});

TableOfContents.displayName = 'TableOfContents';
