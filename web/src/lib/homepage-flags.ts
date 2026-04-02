export type HomepageSectionFlags = {
  showAutomationQueue: boolean;
};

export function getHomepageSectionFlags(_locale: string): HomepageSectionFlags {
  return {
    showAutomationQueue: false,
  };
}
