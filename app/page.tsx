import Portfolio from '@/components/Portfolio';
import { getReadingContent } from '@/lib/reading';
import { getGitHubContent, getYouTubeContent } from '@/lib/social';
import { getStravaContent } from '@/lib/strava';
import { todaysQuotes } from '@/lib/quotes';
import type { PageContent } from '@/lib/types';

// Re-render with fresh DB content at most once a minute; GitHub / YouTube responses are cached for an hour.
export const revalidate = 60;

export default async function Page() {
  const [reading, github, youtube, running] = await Promise.all([getReadingContent(), getGitHubContent(), getYouTubeContent(), getStravaContent()]);
  const content: Record<string, PageContent> = {};
  if (reading) content['hob:Reading'] = reading;
  if (github) content['soc:GitHub'] = github;
  if (youtube) content['soc:YouTube'] = youtube;
  if (running) content['fit:Running'] = running;
  return <Portfolio startMode="home" pageContent={content} quotes={todaysQuotes()} />;
}
