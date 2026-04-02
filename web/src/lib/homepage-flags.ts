export type HomepageSectionFlags = {
  showAutomationQueue: boolean;
  showQuestionHub: boolean;
};

export function getHomepageSectionFlags(_locale: string): HomepageSectionFlags {
  return {
    showAutomationQueue: false,
    showQuestionHub: false,
  };
}
