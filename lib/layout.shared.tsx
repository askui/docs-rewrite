import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { basePath, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // Raw <img> (not next/image) so the static export just copies the SVGs;
      // basePath must be prefixed manually — Next only auto-prefixes
      // next/link and next/image.
      title: (
        <>
          <img
            src={`${basePath}/assets/logo-light.svg`}
            alt="AskUI"
            className="h-5 w-auto dark:hidden"
          />
          <img
            src={`${basePath}/assets/logo-dark.svg`}
            alt="AskUI"
            className="hidden h-5 w-auto dark:block"
          />
          <span className="text-fd-muted-foreground">Docs</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
